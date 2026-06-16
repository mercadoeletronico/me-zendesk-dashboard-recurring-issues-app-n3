import { useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export function useChartFilter() {
  const chartFilter        = useDashboardStore((s) => s.chartFilter);
  const setChartFilter     = useDashboardStore((s) => s.setChartFilter);
  const clearChartFilter   = useDashboardStore((s) => s.clearChartFilter);
  const clearChartFilterKey = useDashboardStore((s) => s.clearChartFilterKey);

  // Toggle de cliente: adiciona se nao existe, remove se ja existe
  const handleClienteClick = useCallback((cliente: string) => {
    const current = chartFilter.clientes;
    if (current.includes(cliente)) {
      setChartFilter({ clientes: current.filter((c) => c !== cliente) });
    } else {
      setChartFilter({ clientes: [...current, cliente] });
    }
  }, [chartFilter.clientes, setChartFilter]);

  const handleTipoClick = useCallback((tipo: string) => {
    chartFilter.tipo === tipo ? clearChartFilterKey('tipo') : setChartFilter({ tipo });
  }, [chartFilter.tipo, setChartFilter, clearChartFilterKey]);

  const handleSubtipoClick = useCallback((subtipo: string) => {
    chartFilter.subtipo === subtipo ? clearChartFilterKey('subtipo') : setChartFilter({ subtipo });
  }, [chartFilter.subtipo, setChartFilter, clearChartFilterKey]);

  const handleKeywordClick = useCallback((keyword: string) => {
    const current = chartFilter.keywords;
    if (current.includes(keyword)) {
      setChartFilter({ keywords: current.filter((k) => k !== keyword) });
    } else {
      setChartFilter({ keywords: [...current, keyword] });
    }
  }, [chartFilter.keywords, setChartFilter]);

  const handleHeatmapClick = useCallback((subtipo: string, data: string) => {
    const current = chartFilter.heatmap;
    if (current?.subtipo === subtipo && current?.data === data) {
      clearChartFilterKey('heatmap');
    } else {
      setChartFilter({ heatmap: { subtipo, data } });
    }
  }, [chartFilter.heatmap, setChartFilter, clearChartFilterKey]);

  const hasActiveFilter = (
    chartFilter.clientes.length > 0 || chartFilter.tipo !== null ||
    chartFilter.subtipo !== null || chartFilter.heatmap !== null || chartFilter.keywords.length > 0
  );

  const activeFilterCount =
    chartFilter.clientes.length +
    chartFilter.keywords.length +
    [chartFilter.tipo, chartFilter.subtipo, chartFilter.heatmap].filter(Boolean).length;

  return {
    chartFilter, hasActiveFilter, activeFilterCount,
    handleClienteClick, handleTipoClick, handleSubtipoClick, handleHeatmapClick, handleKeywordClick,
    setChartFilter, clearChartFilter, clearChartFilterKey,
  };
}

export type ChartFilterActions = ReturnType<typeof useChartFilter>;
