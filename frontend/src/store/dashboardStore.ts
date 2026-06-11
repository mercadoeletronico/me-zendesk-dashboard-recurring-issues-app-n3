import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Ticket, ChartFilter, PreFilter } from '../types';
import { firstDayOfMonth, today } from '../utils/format';

interface DashboardState {
  tickets: Ticket[];
  brands: string[];
  filteredTickets: Ticket[];
  loadedCount: number; // tickets accumulated so far (for progress display)

  chartFilter: ChartFilter;
  preFilter: PreFilter;
  committedFilter: PreFilter;

  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;

  // Actions
  setTickets: (tickets: Ticket[], brands: string[]) => void;
  appendTickets: (newTickets: Ticket[], newBrands: string[], isLastPage: boolean) => void;
  resetForSearch: () => void;
  setChartFilter: (filter: Partial<ChartFilter>) => void;
  clearChartFilter: () => void;
  clearChartFilterKey: (key: keyof ChartFilter) => void;
  setPreFilter: (filter: Partial<PreFilter>) => void;
  commitSearch: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const DEFAULT_CHART_FILTER: ChartFilter = {
  cliente: null,
  tipo: null,
  subtipo: null,
  heatmap: null,
};

const DEFAULT_PRE_FILTER: PreFilter = {
  brand: 'ME Buyers',
  tipoZd: 'incident',
  subtipo: '',
  dateStart: firstDayOfMonth(),
  dateEnd: today(),
};

const TIPO_ZD_PT: Record<string, string> = {
  incident: 'Incidente',
  question: 'Duvida',
  problem: 'Problema',
  task: 'Tarefa',
};

function applyAllFilters(tickets: Ticket[], chartFilter: ChartFilter, preFilter: PreFilter): Ticket[] {
  const preTipoPT = preFilter.tipoZd ? TIPO_ZD_PT[preFilter.tipoZd] ?? '' : '';
  return tickets.filter((t) => {
    if (chartFilter.cliente && t.cliente !== chartFilter.cliente) return false;
    if (chartFilter.tipo && t.tipo !== chartFilter.tipo) return false;
    if (chartFilter.subtipo && t.subtipo !== chartFilter.subtipo) return false;
    if (chartFilter.heatmap) {
      if (t.subtipo !== chartFilter.heatmap.subtipo || t.data !== chartFilter.heatmap.data) return false;
    }
    if (preTipoPT && t.tipo !== preTipoPT) return false;
    if (preFilter.subtipo && t.subtipo !== preFilter.subtipo) return false;
    return true;
  });
}

/** Recomputes recorrência (distinct dates per cliente+subtipo) across all accumulated tickets. */
function computeRecorrencia(tickets: Ticket[]): Ticket[] {
  const dateMap = new Map<string, Set<string>>();
  for (const t of tickets) {
    const key = `${t.cliente}||${t.subtipo}`;
    if (!dateMap.has(key)) dateMap.set(key, new Set());
    if (t.data && t.data !== '-') dateMap.get(key)!.add(t.data);
  }
  return tickets.map((t) => ({
    ...t,
    recorrencia: dateMap.get(`${t.cliente}||${t.subtipo}`)?.size ?? 1,
  }));
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      tickets: [],
      brands: [],
      filteredTickets: [],
      loadedCount: 0,
      chartFilter: DEFAULT_CHART_FILTER,
      preFilter: { ...DEFAULT_PRE_FILTER },
      committedFilter: { ...DEFAULT_PRE_FILTER },
      isLoading: false,
      error: null,
      hasSearched: false,

      setTickets: (tickets, brands) => {
        const { chartFilter, preFilter } = get();
        const filteredTickets = applyAllFilters(tickets, chartFilter, preFilter);
        set({ tickets, brands, filteredTickets, loadedCount: tickets.length, error: null });
      },

      /**
       * Appends a new page of tickets. On the last page, recomputes recorrência
       * across all accumulated tickets so the values are accurate.
       */
      appendTickets: (newTickets, newBrands, isLastPage) => {
        const { tickets: existing, brands: existingBrands, chartFilter, preFilter } = get();
        const combined = [...existing, ...newTickets];
        const allBrands = Array.from(new Set([...existingBrands, ...newBrands])).sort();
        const withRec = isLastPage ? computeRecorrencia(combined) : combined;
        const filteredTickets = applyAllFilters(withRec, chartFilter, preFilter);
        set({
          tickets: withRec,
          brands: allBrands,
          filteredTickets,
          loadedCount: withRec.length,
        });
      },

      resetForSearch: () => {
        set({ tickets: [], filteredTickets: [], loadedCount: 0, error: null, hasSearched: true });
      },

      setChartFilter: (filter) => {
        const { tickets, preFilter, chartFilter: current } = get();
        const newFilter = { ...current, ...filter };
        set({ chartFilter: newFilter, filteredTickets: applyAllFilters(tickets, newFilter, preFilter) });
      },

      clearChartFilter: () => {
        const { tickets, preFilter } = get();
        set({ chartFilter: DEFAULT_CHART_FILTER, filteredTickets: applyAllFilters(tickets, DEFAULT_CHART_FILTER, preFilter) });
      },

      clearChartFilterKey: (key) => {
        const { tickets, preFilter, chartFilter: current } = get();
        const newFilter = { ...current, [key]: null };
        set({ chartFilter: newFilter, filteredTickets: applyAllFilters(tickets, newFilter, preFilter) });
      },

      setPreFilter: (filter) => {
        set((state) => ({ preFilter: { ...state.preFilter, ...filter } }));
      },

      commitSearch: () => {
        set((state) => ({
          committedFilter: { ...state.preFilter },
          hasSearched: true,
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      reset: () => set({
        tickets: [],
        brands: [],
        filteredTickets: [],
        loadedCount: 0,
        chartFilter: DEFAULT_CHART_FILTER,
        preFilter: { ...DEFAULT_PRE_FILTER },
        committedFilter: { ...DEFAULT_PRE_FILTER },
        isLoading: false,
        error: null,
        hasSearched: false,
      }),
    }),
    { name: 'dashboard' }
  )
);
