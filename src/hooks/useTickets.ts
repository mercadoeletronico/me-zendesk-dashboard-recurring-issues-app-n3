import { useEffect, useRef } from 'react';
import { fetchTicketsPage } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { registerAbort, stopSearch } from '@/lib/searchController';

const MAX_PAGES = 50;

export function useTickets() {
  const committedFilter = useDashboardStore((s) => s.committedFilter);
  const hasSearched     = useDashboardStore((s) => s.hasSearched);
  const appendTickets   = useDashboardStore((s) => s.appendTickets);
  const resetForSearch  = useDashboardStore((s) => s.resetForSearch);
  const setLoading      = useDashboardStore((s) => s.setLoading);
  const setError        = useDashboardStore((s) => s.setError);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!hasSearched) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    registerAbort(() => controller.abort());

    async function loadProgressively() {
      resetForSearch();
      setLoading(true);
      setError(null);

      let cursor: string | undefined = undefined;
      let page = 0;

      try {
        while (page < MAX_PAGES) {
          if (controller.signal.aborted) return;
          page++;
          const response = await fetchTicketsPage(committedFilter, cursor, controller.signal);
          if (controller.signal.aborted) return;
          if (!response) { setError('Resposta inválida do servidor'); break; }

          const isLastPage = !response.nextCursor;
          appendTickets(response.tickets, response.brands ?? [], isLastPage);
          if (isLastPage) break;
          cursor = response.nextCursor!;
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(msg);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProgressively();
    return () => { controller.abort(); };
  }, [hasSearched, committedFilter]);
}

export { stopSearch };
