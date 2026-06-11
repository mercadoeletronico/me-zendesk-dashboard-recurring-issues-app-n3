import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import {
  Ticket,
  N8nWebhookPayload,
  N8nWebhookResponse,
  TicketsRequest,
  TicketsResponse,
} from '../types';

function extractBrands(tickets: Ticket[]): string[] {
  const brands = new Set<string>();
  for (const t of tickets) {
    if (t.brand) brands.add(t.brand);
  }
  return Array.from(brands).sort();
}

export class N8nService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.N8N_WEBHOOK_URL,
      timeout: 120_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Fetches a single page (~1000 tickets) from n8n.
   * Returns tickets for this page + nextCursor (null if last page).
   * Recorrência is NOT computed here — the frontend accumulates pages
   * and computes recorrência once all pages are loaded.
   */
  async fetchPage(request: TicketsRequest): Promise<TicketsResponse> {
    const payload: N8nWebhookPayload = {
      email: env.ZD_EMAIL,
      token: env.ZD_TOKEN,
      subdomain: env.ZD_SUBDOMAIN,
      dateStart: request.dateStart,
      dateEnd: request.dateEnd,
      ...(request.brand ? { brand: request.brand } : {}),
      ...(request.tipoFilter ? { tipoFilter: request.tipoFilter } : {}),
      ...(request.subtipoFilter ? { subtipoFilter: request.subtipoFilter } : {}),
      ...(request.cursor ? { cursor: request.cursor } : {}),
    };

    console.log(`[n8n] fetchPage — cursor: ${request.cursor ?? 'none'}`);

    const response = await this.client.post<N8nWebhookResponse>('', payload);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.error ?? 'n8n returned an unsuccessful response');
    }

    const tickets: Ticket[] = data.tickets ?? [];
    const brands = extractBrands(tickets);
    const nextCursor = (data.nextCursor && tickets.length > 0) ? data.nextCursor : null;

    console.log(`[n8n] fetchPage — got ${tickets.length} tickets, nextCursor: ${nextCursor ?? 'none'}`);

    return { tickets, brands, nextCursor, count: tickets.length };
  }
}

export const n8nService = new N8nService();
