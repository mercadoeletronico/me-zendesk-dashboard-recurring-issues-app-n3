'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useDashboardStore } from '@/store/dashboardStore';
import { useChartFilter } from '@/hooks/useChartFilter';
import { getColor } from '@/utils/colors';
import { EmptyState } from '@/components/common/EmptyState';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SubtipoChart() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleSubtipoClick } = useChartFilter();

  const { labels, data } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      counts.set(t.subtipo, (counts.get(t.subtipo) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
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
        },
      },
    },
  };

  return (
    <div style={{ height: `${Math.max(labels.length * 32, 180)}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function TipoSubtipoChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Tickets por Problema (Subtipo)</h3>
      <SubtipoChart />
      <p className="text-xs text-gray-400 mt-2 text-center">Clique para filtrar</p>
    </div>
  );
}
