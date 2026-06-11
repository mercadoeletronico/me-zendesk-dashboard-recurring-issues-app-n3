// ── Ticket ────────────────────────────────────────────────────────────────────

export interface Ticket {
  id: number;
  subject: string;
  cliente: string;
  tipo: string;
  subtipo: string;
  brand: string;
  status: string;
  data: string;       // YYYY-MM-DD (UTC)
  dayOfMonth: number;
  recorrencia: number;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface ChartFilter {
  cliente: string | null;
  tipo: string | null;
  subtipo: string | null;
  heatmap: { subtipo: string; data: string } | null;
}

export interface PreFilter {
  brand: string;        // 'ME Buyers' | 'ME Suppliers' | ''
  tipoZd: string;       // 'incident' | 'question' | 'problem' | 'task' | ''
  subtipo: string;
  dateStart: string;
  dateEnd: string;
}

export interface SortConfig {
  key: keyof Ticket;
  direction: 'asc' | 'desc';
}

// ── API (cliente → /api/tickets) ─────────────────────────────────────────────

export interface TicketsApiResponse {
  tickets: Ticket[];
  brands: string[];
  nextCursor?: string | null; // null/undefined = última página
}

// ── API (servidor → n8n) ──────────────────────────────────────────────────────

export interface TicketsRequest {
  dateStart: string;
  dateEnd: string;
  brand: string;
  tipoFilter: string;
  subtipoFilter: string;
  cursor?: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  brands: string[];
  nextCursor: string | null;
  count: number;
}

export interface N8nWebhookPayload {
  email: string;
  token: string;
  subdomain: string;
  dateStart: string;
  dateEnd: string;
  brand?: string;
  tipoFilter?: string;
  subtipoFilter?: string;
  cursor?: string;
}

export interface N8nWebhookResponse {
  success: boolean;
  tickets: Ticket[];
  count: number;
  nextCursor: string | null;
  error?: string;
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

export interface KpiData {
  total: number;
  clientesAtivos: number;
  subtipoMaisFrequente: string;
  subtipoMaisFrequenteCount: number;
  maiorRecorrenciaGeral: { dias: number; subtipos: string[] } | null;
  maiorRecorrenciaCliente: { recorrencia: number; entries: Array<{ cliente: string; subtipo: string }> } | null;
}
