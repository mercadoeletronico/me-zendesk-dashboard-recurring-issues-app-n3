import { Ticket, KpiData } from '@/types';

export interface RecorrenciaEntry {
  cliente: string;
  subtipo: string;
  distinctDates: number;
  ticketCount: number;
}

export function buildRecorrenciaMap(tickets: Ticket[]): Map<string, RecorrenciaEntry> {
  const dateMap  = new Map<string, Set<string>>();
  const countMap = new Map<string, number>();

  for (const t of tickets) {
    const key = `${t.cliente}||${t.subtipo}`;
    if (!dateMap.has(key)) dateMap.set(key, new Set());
    if (t.data && t.data !== '-') dateMap.get(key)!.add(t.data);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const result = new Map<string, RecorrenciaEntry>();
  for (const [key, dates] of dateMap.entries()) {
    const [cliente, subtipo] = key.split('||');
    result.set(key, {
      cliente,
      subtipo,
      distinctDates: dates.size,
      ticketCount:   countMap.get(key) ?? 0,
    });
  }
  return result;
}

export function computeKpis(tickets: Ticket[]): KpiData {
  if (tickets.length === 0) {
    return {
      total: 0,
      clientesAtivos: 0,
      subtipoMaisFrequente: '—',
      subtipoMaisFrequenteCount: 0,
      maiorRecorrenciaGeral: null,
      maiorRecorrenciaCliente: null,
    };
  }

  const clienteSet = new Set(tickets.map((t) => t.cliente));

  // Subtipo mais frequente
  const subtipoCount = new Map<string, number>();
  for (const t of tickets) {
    subtipoCount.set(t.subtipo, (subtipoCount.get(t.subtipo) ?? 0) + 1);
  }
  const sortedSubtipos        = [...subtipoCount.entries()].sort((a, b) => b[1] - a[1]);
  const subtipoMaisFrequente  = sortedSubtipos[0]?.[0] ?? '—';
  const subtipoMaisFrequenteCount = sortedSubtipos[0]?.[1] ?? 0;

  // Maior Recorrência Geral (distinct dates por subtipo)
  const subtipoDateMap = new Map<string, Set<string>>();
  for (const t of tickets) {
    if (!t.subtipo || t.subtipo === '-') continue;
    if (!subtipoDateMap.has(t.subtipo)) subtipoDateMap.set(t.subtipo, new Set());
    if (t.data && t.data !== '-') subtipoDateMap.get(t.subtipo)!.add(t.data);
  }
  const sortedGeral = [...subtipoDateMap.entries()].sort(
    (a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0], 'pt-BR')
  );
  let maiorRecorrenciaGeral: { dias: number; subtipos: string[] } | null = null;
  if (sortedGeral.length > 0) {
    const maxDias = sortedGeral[0][1].size;
    const subtipos = sortedGeral
      .filter(([, dates]) => dates.size === maxDias)
      .map(([s]) => s)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    maiorRecorrenciaGeral = { dias: maxDias, subtipos };
  }

  // Maior Recorrência por Cliente
  const validTickets = tickets.filter((t) => t.subtipo && t.subtipo !== '-');
  let maiorRecorrenciaCliente: { recorrencia: number; entries: Array<{ cliente: string; subtipo: string }> } | null = null;
  if (validTickets.length > 0) {
    const maxRec = Math.max(...validTickets.map((t) => t.recorrencia));
    const seen   = new Set<string>();
    const entries: Array<{ cliente: string; subtipo: string }> = [];
    validTickets
      .filter((t) => t.recorrencia === maxRec)
      .sort((a, b) =>
        a.cliente.localeCompare(b.cliente, 'pt-BR') || a.subtipo.localeCompare(b.subtipo, 'pt-BR')
      )
      .forEach((t) => {
        const key = `${t.cliente}||${t.subtipo}`;
        if (!seen.has(key)) { seen.add(key); entries.push({ cliente: t.cliente, subtipo: t.subtipo }); }
      });
    maiorRecorrenciaCliente = entries.length > 0 ? { recorrencia: maxRec, entries } : null;
  }

  return {
    total: tickets.length,
    clientesAtivos: clienteSet.size,
    subtipoMaisFrequente,
    subtipoMaisFrequenteCount,
    maiorRecorrenciaGeral,
    maiorRecorrenciaCliente,
  };
}
