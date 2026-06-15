import { PreFilter, TicketsApiResponse } from '@/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown = null;
    try { body = await res.json(); } catch { /* ignore */ }
    const message =
      (body as { error?: { message?: string } })?.error?.message ??
      `HTTP ${res.status}: ${res.statusText}`;
    throw new ApiError(message, res.status, body);
  }
  return res.json() as Promise<T>;
}

/**
 * Busca uma página (~1000 tickets) da API Next.js /api/tickets.
 * cursor=undefined = primeira página.
 */
export async function fetchTicketsPage(
  filter: PreFilter,
  cursor: string | undefined,
  signal: AbortSignal
): Promise<TicketsApiResponse> {
  const res = await fetch('/api/tickets', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateStart:     filter.dateStart,
      dateEnd:       filter.dateEnd,
      brand:         filter.brand,
      tipoFilter:    filter.tipoZd,
      subtipoFilter: filter.subtipos.join(","),
      cursor,
    }),
    signal,
  });

  return handleResponse<TicketsApiResponse>(res);
}
