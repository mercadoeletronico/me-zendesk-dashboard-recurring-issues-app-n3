/**
 * zendesk.service.ts
 *
 * Servico server-side que chama a API ZenDesk diretamente.
 * Normalizacao: subtipo = Product + "::" + Module + "::" + Subtipo
 *
 * Regra de resolucao dos campos compostos:
 *   - Seguir cadeia de agent_conditions (Product->Module->Subtipo)
 *   - Coletar TODOS os candidatos (conditions + keyword fallback)
 *   - Preferir labels SEM "::" (evita campos hierarquicos com labels compostos)
 *   - Apenas usar label com "::" se nenhum label limpo estiver disponivel
 *
 * Filtros server-side:
 *   - brand: resolve nome -> brand_id e adiciona brand_id:<id> na query ZD
 *   - tipoFilter: ja vem como ZD raw value (incident/question/problem/task)
 *                 adiciona ticket_type:<value> na query ZD
 */

import { Ticket, TicketsRequest, TicketsResponse } from '@/types';

// --- Env vars ----------------------------------------------------------------

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) console.warn('[zendesk] ' + key + ' nao configurado');
  return val ?? '';
}

function zdBase(): string { return 'https://' + getEnv('ZD_SUBDOMAIN') + '.zendesk.com/api/v2'; }
function zdAuth(): string { return 'Basic ' + Buffer.from(getEnv('ZD_EMAIL') + '/token:' + getEnv('ZD_TOKEN')).toString('base64'); }
function zdHdr(): Record<string, string> {
  return { Authorization: zdAuth(), 'Content-Type': 'application/json', Accept: 'application/json' };
}

// --- Tipos raw ZenDesk -------------------------------------------------------

interface ZdTicketRaw {
  id: number;
  subject?: string;
  type?: string;
  status?: string;
  organization_id?: number | null;
  brand_id?: number | null;
  created_at?: string;
  custom_fields?: Array<{ id: number; value: string | null }>;
}

interface ZdField {
  id: number;
  type: string;
  title: string;
  custom_field_options?: Array<{ value: string; name: string }>;
}

interface ZdForm {
  id: number;
  agent_conditions?: Array<{
    parent_field_id: number;
    value: string;
    child_fields?: Array<{ id: number }>;
  }>;
}

interface ZdBrand { id: number; name: string; }
interface ZdOrg   { id: number; name: string; }

interface ZdSearchPage {
  results: ZdTicketRaw[];
  meta: { has_more: boolean; after_cursor: string; };
}

// --- Cache de metadados ------------------------------------------------------

const META_TTL = 5 * 60 * 1000;

interface MetaCache {
  fields: ZdField[];
  forms:  ZdForm[];
  brands: ZdBrand[];
  ts:     number;
}

let _meta: MetaCache | null = null;

// --- Fetch helper ------------------------------------------------------------

async function zdFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: zdHdr(), cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error('ZenDesk ' + res.status + ' -> ' + url + '\n' + body.slice(0, 400));
  }
  return res.json() as Promise<T>;
}

// --- Metadados ---------------------------------------------------------------

async function getMeta(): Promise<MetaCache> {
  if (_meta && Date.now() - _meta.ts < META_TTL) return _meta;
  console.log('[zendesk] Buscando metadados...');
  const [fr, fo, br] = await Promise.all([
    zdFetch<{ ticket_fields: ZdField[] }>(zdBase() + '/ticket_fields.json'),
    zdFetch<{ ticket_forms:  ZdForm[]  }>(zdBase() + '/ticket_forms.json'),
    zdFetch<{ brands: ZdBrand[] }>(zdBase() + '/brands.json'),
  ]);
  _meta = {
    fields: fr.ticket_fields ?? [],
    forms:  fo.ticket_forms  ?? [],
    brands: br.brands        ?? [],
    ts:     Date.now(),
  };
  console.log('[zendesk] ' + _meta.fields.length + ' fields, ' + _meta.forms.length + ' forms, ' + _meta.brands.length + ' brands');
  return _meta;
}

// --- Organizacoes em batch ---------------------------------------------------

async function fetchOrgs(orgIds: number[]): Promise<Record<number, string>> {
  if (!orgIds.length) return {};
  const unique = [...new Set(orgIds)];
  const map: Record<number, string> = {};
  for (let i = 0; i < unique.length; i += 100) {
    const ids = unique.slice(i, i + 100).join(',');
    const r   = await zdFetch<{ organizations: ZdOrg[] }>(zdBase() + '/organizations/show_many.json?ids=' + ids);
    for (const o of (r.organizations ?? [])) map[o.id] = o.name;
  }
  return map;
}

// --- FieldDef ----------------------------------------------------------------

function normT(s: string): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

interface FieldDef {
  id: number;
  title: string;
  optionMap: Record<string, string>; // rawValue -> label
}

function toFieldDef(f: ZdField): FieldDef {
  return {
    id: f.id,
    title: f.title,
    optionMap: Object.fromEntries((f.custom_field_options ?? []).map((o) => [o.value, o.name])),
  };
}

// --- FieldChain: Product -> Module -> Subtipo --------------------------------
//
// condTree[parentId][parentRawValue] = [childFieldId, ...]
//
// Campos compostos (ZenDesk guarda labels hierarquicos como
// "Module::Subtipo" em um campo separado) sao identificados pelo
// fato de terem opcoes cujos LABELS contem "::".
// A resolucao PRIORIZA campos com labels limpos (sem "::").

interface FieldChain {
  productField:    FieldDef | null;
  allFields:       Map<number, FieldDef>;
  condTree:        Map<number, Map<string, number[]>>;
  moduleFallback:  FieldDef[];
  subtipoFallback: FieldDef[];
}

function hasCompoundLabels(fd: FieldDef): boolean {
  return Object.values(fd.optionMap).some((label) => label.includes('::'));
}

function buildFieldChain(fields: ZdField[], forms: ZdForm[]): FieldChain {
  const taggers   = fields.filter((f) => f.type === 'tagger');
  const allFields = new Map(taggers.map((f) => [f.id, toFieldDef(f)]));

  // Arvore de condicoes
  const condTree = new Map<number, Map<string, number[]>>();
  for (const form of forms) {
    for (const cond of (form.agent_conditions ?? [])) {
      if (!condTree.has(cond.parent_field_id)) condTree.set(cond.parent_field_id, new Map());
      const vm = condTree.get(cond.parent_field_id)!;
      if (!vm.has(cond.value)) vm.set(cond.value, []);
      const arr = vm.get(cond.value)!;
      for (const ch of (cond.child_fields ?? [])) {
        if (!arr.includes(ch.id)) arr.push(ch.id);
      }
    }
  }

  // Campo Product: keyword no titulo
  const productRaw   = taggers.find((t) => ['product', 'produto'].some((kw) => normT(t.title).includes(kw)));
  const productField = productRaw ? toFieldDef(productRaw) : null;
  const productId    = productField?.id;

  // Module fallback: keyword no titulo, preferir campos sem labels compostos
  const moduleFallback = taggers
    .filter((f) =>
      f.id !== productId &&
      ['module', 'modulo'].some((kw) => normT(f.title).includes(kw))
    )
    .map(toFieldDef)
    .sort((a, b) => {
      const ac = hasCompoundLabels(a) ? 1 : 0;
      const bc = hasCompoundLabels(b) ? 1 : 0;
      return ac - bc;
    });

  // IDs de campos Module conhecidos (conditions + keyword)
  const knownModuleIds = new Set([
    ...moduleFallback.map((f) => f.id),
    ...(productField ? [...(condTree.get(productField.id)?.values() ?? [])].flat() : []),
  ]);

  // Subtipo fallback: filhos dos campos Module + keyword "subtipo"
  const subtipoChildIds = new Set<number>();
  for (const mid of knownModuleIds) {
    for (const arr of (condTree.get(mid)?.values() ?? [])) {
      for (const cid of arr) subtipoChildIds.add(cid);
    }
  }

  const subtipoFallback = taggers
    .filter((f) =>
      (subtipoChildIds.has(f.id) || normT(f.title).includes('subtipo')) &&
      !knownModuleIds.has(f.id) &&
      f.id !== productId
    )
    .map(toFieldDef)
    .sort((a, b) => {
      const ac = hasCompoundLabels(a) ? 1 : 0;
      const bc = hasCompoundLabels(b) ? 1 : 0;
      return ac - bc;
    });

  const mIds = moduleFallback.map((f) => String(f.id)).join(', ');
  const sIds = subtipoFallback.map((f) => String(f.id)).join(', ');
  console.log(
    '[zendesk] FieldChain ->',
    'Product:', productField ? productField.title + ' (' + String(productField.id) + ')' : 'nao encontrado',
    '| Module fallback: [' + mIds + ']',
    '| Subtipo fallback: [' + sIds + ']'
  );

  return { productField, allFields, condTree, moduleFallback, subtipoFallback };
}

// --- Resolucao do subtipo composto -------------------------------------------

type CfArr = Array<{ id: number; value: string | null }>;

function getRaw(cf: CfArr, id: number): string {
  return cf.find((c) => c.id === id)?.value ?? '';
}

// Retorna o melhor label de uma lista de candidatos:
// 1o: label sem "::" (nao composto)
// 2o: qualquer label disponivel
function bestLabel(candidates: Array<{ label: string }>): string {
  const clean = candidates.find((c) => c.label && !c.label.includes('::'));
  if (clean) return clean.label;
  return candidates.find((c) => c.label)?.label ?? '';
}

function resolveComposite(cf: CfArr, chain: FieldChain): string {
  // ---- Product ----
  const productRaw = chain.productField ? getRaw(cf, chain.productField.id) : '';
  const product    = productRaw && chain.productField
    ? (chain.productField.optionMap[productRaw] ?? productRaw)
    : '';

  // ---- Module ----
  // Coletar candidatos via conditions, depois via fallback
  const moduleCandidates: Array<{ fieldId: number; raw: string; label: string }> = [];

  if (chain.productField && productRaw) {
    const childIds = chain.condTree.get(chain.productField.id)?.get(productRaw) ?? [];
    for (const cid of childIds) {
      const fd = chain.allFields.get(cid);
      if (!fd) continue;
      const raw = getRaw(cf, cid);
      if (!raw) continue;
      moduleCandidates.push({ fieldId: cid, raw, label: fd.optionMap[raw] ?? raw });
    }
  }
  for (const mf of chain.moduleFallback) {
    if (moduleCandidates.some((c) => c.fieldId === mf.id)) continue;
    const raw = getRaw(cf, mf.id);
    if (!raw) continue;
    moduleCandidates.push({ fieldId: mf.id, raw, label: mf.optionMap[raw] ?? raw });
  }

  // Escolher: preferir label sem "::"
  const moduleWinner = moduleCandidates.find((c) => c.label && !c.label.includes('::'))
    ?? moduleCandidates.find((c) => c.label);

  const activeModuleId = moduleWinner?.fieldId ?? 0;
  const moduleRaw      = moduleWinner?.raw      ?? '';
  const moduleLabel    = moduleWinner?.label     ?? '';

  // ---- Subtipo ----
  // Coletar candidatos via conditions do Module, depois via fallback
  const subtipoCandidates: Array<{ label: string }> = [];

  if (activeModuleId && moduleRaw) {
    const childIds = chain.condTree.get(activeModuleId)?.get(moduleRaw) ?? [];
    for (const cid of childIds) {
      const fd = chain.allFields.get(cid);
      if (!fd) continue;
      const raw = getRaw(cf, cid);
      if (!raw) continue;
      subtipoCandidates.push({ label: fd.optionMap[raw] ?? raw });
    }
  }
  for (const sf of chain.subtipoFallback) {
    const raw = getRaw(cf, sf.id);
    if (!raw) continue;
    subtipoCandidates.push({ label: sf.optionMap[raw] ?? raw });
  }

  // Escolher: preferir label sem "::"
  const subtipoLabel = bestLabel(subtipoCandidates);

  const parts = [product, moduleLabel, subtipoLabel].filter(Boolean);
  return parts.length > 0 ? parts.join('::') : '-';
}

// --- Mapeamentos de label ----------------------------------------------------

const TIPO_PT: Record<string, string> = {
  incident: 'Incidente',
  question: 'Duvida',
  problem:  'Problema',
  task:     'Tarefa',
};

const STATUS_PT: Record<string, string> = {
  new: 'Novo', open: 'Aberto', pending: 'Pendente',
  hold: 'Em Espera', solved: 'Resolvido', closed: 'Fechado',
};

// --- Normalizacao de tickets -------------------------------------------------

function normalizeTickets(
  raw:    ZdTicketRaw[],
  meta:   MetaCache,
  orgMap: Record<number, string>,
  chain:  FieldChain,
): Ticket[] {
  const brandMap = Object.fromEntries(meta.brands.map((b) => [b.id, b.name]));
  return raw.map((r): Ticket => {
    const cf      = r.custom_fields ?? [];
    const tipo    = TIPO_PT[r.type ?? ''] ?? r.type ?? '-';
    const subtipo = resolveComposite(cf, chain);
    const brand   = r.brand_id ? (brandMap[r.brand_id] ?? 'brand_' + r.brand_id) : '-';
    const cliente = r.organization_id ? (orgMap[r.organization_id] ?? 'org_' + r.organization_id) : 'Sem organizacao';
    const data    = (r.created_at ?? '').slice(0, 10);
    const day     = data ? parseInt(data.slice(8, 10), 10) : 0;
    const status  = STATUS_PT[r.status ?? ''] ?? r.status ?? '-';
    return {
      id: r.id, subject: r.subject ?? '(sem titulo)',
      cliente, tipo, subtipo, brand, status, data, dayOfMonth: day, recorrencia: 0,
    };
  });
}

function extractBrands(tickets: Ticket[]): string[] {
  return [...new Set(tickets.map((t) => t.brand).filter(Boolean))].sort();
}

// --- Servico -----------------------------------------------------------------

class ZendeskService {
  async fetchPage(request: TicketsRequest): Promise<TicketsResponse> {
    const { dateStart, dateEnd, brand: brandFilter, tipoFilter, cursor } = request;

    // Meta precisa vir antes da URL para resolver brand_id (geralmente ja esta em cache)
    const meta = await getMeta();

    // Montar query com filtros server-side (reduz volume antes de chegar ao Next.js)
    const queryParts: string[] = ['created>=' + dateStart, 'created<=' + dateEnd];

    // Filtro de brand: resolve nome -> ID
    if (brandFilter) {
      const brandObj = meta.brands.find((b) => b.name === brandFilter);
      if (brandObj) {
        queryParts.push('brand_id:' + brandObj.id);
      } else {
        console.warn('[zendesk] brand nao encontrado: "' + brandFilter + '"');
      }
    }

    // Filtro de tipo: tipoFilter ja vem como ZD raw value (incident/question/problem/task)
    if (tipoFilter) {
      queryParts.push('ticket_type:' + tipoFilter);
    }

    const params = new URLSearchParams({
      query: queryParts.join(' '),
      'filter[type]': 'ticket',
      'page[size]': '1000',
    });
    if (cursor) params.set('page[after]', cursor);

    const url = zdBase() + '/search/export.json?' + params.toString();
    console.log(
      '[zendesk] fetchPage ' + dateStart + ' -> ' + dateEnd,
      '| brand: ' + (brandFilter || 'todos'),
      '| tipo: ' + (tipoFilter || 'todos'),
      '| cursor: ' + (cursor ?? 'inicio'),
    );

    const page       = await zdFetch<ZdSearchPage>(url);
    const rawTickets = page.results ?? [];
    const nextCursor = page.meta?.has_more && rawTickets.length > 0
      ? (page.meta.after_cursor ?? null)
      : null;

    console.log('[zendesk] ' + rawTickets.length + ' tickets | next: ' + (nextCursor ?? 'fim'));

    const orgIds = [...new Set(
      rawTickets.map((t) => t.organization_id).filter((id): id is number => typeof id === 'number')
    )];
    const orgMap = await fetchOrgs(orgIds);

    const chain   = buildFieldChain(meta.fields, meta.forms);
    const tickets = normalizeTickets(rawTickets, meta, orgMap, chain);

    return { tickets, brands: extractBrands(tickets), nextCursor, count: tickets.length };
  }
}

export const zdService = new ZendeskService();
