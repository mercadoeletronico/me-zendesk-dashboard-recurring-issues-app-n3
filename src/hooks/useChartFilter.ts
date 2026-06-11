import { useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export function useChartFilter() {
  const chartFilter        = useDashboardStore((s) => s.chartFilter);
  const setChartFilter     = useDashboardStore((s) => s.setChartFilter);
  const clearChartFilter   = useDashboardStore((s) => s.clearChartFilter);
  const clearChartFilterKey = useDashboardStore((s) => s.clearChartFilterKey);

  const handleClienteClick = useCallback((cliente: string) => {
    chartFilter.cliente === cliente ? clearChartFilterKey('cliente') : setChartFilter({ cliente });
  }, [chartFilter.cliente, setChartFilter, clearChartFilterKey]);

  const handleTipoClick = useCallback((tipo: string) => {
    chartFilter.tipo === tipo ? clearChartFilterKey('tipo') : setChartFilter({ tipo });
  }, [chartFilter.tipo, setChartFilter, clearChartFilterKey]);

  const handleSubtipoClick = useCallback((subtipo: string) => {
    chartFilter.subtipo === subtipo ? clearChartFilterKey('subtipo') : setChartFilter({ subtipo });
  }, [chartFilter.subtipo, setChartFilter, clearChartFilterKey]);

  const handleHeatmapClick = useCallback((subtipo: string, data: string) => {
    const current = chartFilter.heatmap;
    if (current?.subtipo === subtipo && current?.data === data) {
      clearChartFilterKey('heatmap');
    } else {
      setChartFilter({ heatmap: { subtipo, data } });
    }
  }, [chartFilter.heatmap, setChartFilter, clearChartFilterKey]);

  const hasActiveFilter = (
    chartFilter.cliente !== null || chartFilter.tipo !== null ||
    chartFilter.subtipo !== null || chartFilter.heatmap !== null
  );

  const activeFilterCount = [
    chartFilter.cliente, chartFilter.tipo, chartFilter.subtipo, chartFilter.heatmap,
  ].filter(Boolean).length;

  return {
    chartFilter, hasActiveFilter, activeFilterCount,
    handleClienteClick, handleTipoClick, handleSubtipoClick, handleHeatmapClick,
    clearChartFilter, clearChartFilterKey,
  };
}

export type ChartFilterActions = ReturnType<typeof useChartFilter>;
