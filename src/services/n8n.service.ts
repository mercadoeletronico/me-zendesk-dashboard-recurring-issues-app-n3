/**
 * Serviço server-side que chama o webhook n8n.
 * Usado apenas pela API route /api/tickets — nunca importado por código cliente.
 */
import {
  Ticket,
  N8nWebhookPayload,
  N8nWebhookResponse,
  TicketsRequest,
  TicketsResponse,
} from '@/types';

function extractBrands(tickets: Ticket[]): string[] {
  const brands = new Set<string>();
  for (const t of tickets) { if (t.brand) brands.add(t.brand); }
  return Array.from(brands).sort();
}

function getEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

class N8nService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = getEnv('N8N_WEBHOOK_URL');
    if (!this.webhookUrl) {
      console.warn('[n8n] N8N_WEBHOOK_URL não configurada');
    }
  }

  async fetchPage(request: TicketsRequest): Promise<TicketsResponse> {
    const payload: N8nWebhookPayload = {
      email:         getEnv('ZD_EMAIL'),
      token:         getEnv('ZD_TOKEN'),
      subdomain:     getEnv('ZD_SUBDOMAIN'),
      dateStart:     request.dateStart,
      dateEnd:       request.dateEnd,
      brand:         request.brand         ?? '',
      tipoFilter:    request.tipoFilter    ?? '',
      subtipoFilter: request.subtipoFilter ?? '',
      ...(request.cursor ? { cursor: request.cursor } : {}),
    };

    console.log(`[n8n] fetchPage — cursor: ${request.cursor ?? 'none'}`);

    const response = await fetch(this.webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      // Next.js cache: sem cache para dados dinâmicos
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`n8n respondeu com status ${response.status}`);
    }

    const data: N8nWebhookResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error ?? 'n8n retornou resposta sem sucesso');
    }

    const tickets    = data.tickets ?? [];
    const brands     = extractBrands(tickets);
    const nextCursor = (data.nextCursor && tickets.length > 0) ? data.nextCursor : null;

    console.log(`[n8n] fetchPage — ${tickets.length} tickets, nextCursor: ${nextCursor ?? 'none'}`);

    return { tickets, brands, nextCursor, count: tickets.length };
  }
}

export const n8nService = new N8nService();
