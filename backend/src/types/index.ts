export interface Ticket {
  id: number;
  subject: string;
  cliente: string;
  tipo: string;
  subtipo: string;
  brand: string;
  status: string;
  data: string;
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
  brand: string;
  tipoZd: string;
  subtipo: string;
  dateStart: string;
  dateEnd: string;
}

export interface TicketsRequest {
  dateStart: string;
  dateEnd: string;
  brand: string;
  tipoFilter: string;
  subtipoFilter: string;
  cursor?: string; // pagination cursor for progressive loading
}

export interface TicketsResponse {
  tickets: Ticket[];
  brands: string[];
  nextCursor: string | null; // null = last page
  count: number;
}

// Payload sent to n8n webhook — must include ZenDesk credentials
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

// Response from n8n — tickets are already normalized
export interface N8nWebhookResponse {
  success: boolean;
  tickets: Ticket[];
  count: number;
  nextCursor: string | null;
  error?: string;
}
