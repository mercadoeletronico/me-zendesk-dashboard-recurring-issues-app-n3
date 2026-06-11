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

export interface KpiData {
  total: number;
  clientesAtivos: number;
  subtipoMaisFrequente: string;
  subtipoMaisFrequenteCount: number;
  maiorRecorrenciaGeral: { dias: number; subtipos: string[] } | null;
  maiorRecorrenciaCliente: { recorrencia: number; entries: Array<{ cliente: string; subtipo: string }> } | null;
}

export interface TicketsApiResponse {
  tickets: Ticket[];
  brands: string[];
  nextCursor?: string; // undefined means this is the last page
}

export interface SortConfig {
  key: keyof Ticket;
  direction: 'asc' | 'desc';
}
