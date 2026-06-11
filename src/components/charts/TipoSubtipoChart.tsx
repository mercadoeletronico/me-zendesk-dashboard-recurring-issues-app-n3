'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useDashboardStore } from '@/store/dashboardStore';
import { useChartFilter } from '@/hooks/useChartFilter';
import { getColor } from '@/utils/colors';
import { EmptyState } from '@/components/common/EmptyState';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TipoChart() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleTipoClick } = useChartFilter();

  const { labels, data } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      counts.set(t.tipo, (counts.get(t.tipo) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) };
  }, [tickets]);

  if (labels.length === 0) return <EmptyState description="Sem dados de tipo." />;

  const backgroundColors = labels.map((label, i) => {
    if (chartFilter.tipo && chartFilter.tipo !== label) return `${getColor(i)}55`;
    return getColor(i);
  });

  const chartData = {
    labels,
    datasets: [{ data, backgroundColor: backgroundColors, borderWidth: 2, borderColor: '#fff' }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) handleTipoClick(labels[elements[0].index]);
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#374151', font: { size: 12 }, padding: 12 },
      },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        callbacks: {
          label: (ctx: { label: string; parsed: number; dataset: { data: number[] } }) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-52">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

function SubtipoChart() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleSubtipoClick } = useChartFilter();

  const { labels, data } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      counts.set(t.subtipo, (counts.get(t.subtipo) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) };
  }, [tickets]);

  if (labels.length === 0) return <EmptyState description="Sem dados de subtipo." />;

  const backgroundColors = labels.map((label, i) => {
    if (chartFilter.subtipo && chartFilter.subtipo !== label) return `${getColor(i)}55`;
    return getColor(i);
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tickets',
        data,
        backgroundColor: backgroundColors,
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) handleSubtipoClick(labels[elements[0].index]);
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
      },
    },
    scales: {
      x: {
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: function(this: unknown, _: unknown, index: number) {
            const label = labels[index] ?? '';
            return label.length > 22 ? label.slice(0, 21) + '…' : label;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${Math.max(labels.length * 28, 180)}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function TipoSubtipoChart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tickets por Tipo</h3>
        <TipoChart />
        <p className="text-xs text-gray-400 mt-2 text-center">Clique para filtrar</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-y-auto max-h-[420px]">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tickets por Subtipo</h3>
        <SubtipoChart />
        <p className="text-xs text-gray-400 mt-2 text-center">Clique para filtrar</p>
      </div>
    </div>
  );
}
