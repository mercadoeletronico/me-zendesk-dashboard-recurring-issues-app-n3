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
import { useDashboardStore } from '../../store/dashboardStore';
import { useChartFilter } from '../../hooks/useChartFilter';
import { getColor } from '../../utils/colors';
import { EmptyState } from '../common/EmptyState';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ClienteChart() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleClienteClick } = useChartFilter();

  const { labels, data } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      counts.set(t.cliente, (counts.get(t.cliente) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    return {
      labels: sorted.map(([k]) => k),
      data: sorted.map(([, v]) => v),
    };
  }, [tickets]);

  if (labels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tickets por Cliente</h3>
        <EmptyState description="Sem dados para o período selecionado." />
      </div>
    );
  }

  const backgroundColors = labels.map((label, i) => {
    if (chartFilter.cliente && chartFilter.cliente !== label) return `${getColor(i)}55`;
    return getColor(i);
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tickets',
        data,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) {
        handleClienteClick(labels[elements[0].index]);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => ` ${ctx.parsed.y ?? 0} tickets`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          maxRotation: 35,
          callback: function(this: unknown, _: unknown, index: number) {
            const label = labels[index] ?? '';
            return label.length > 14 ? label.slice(0, 13) + '…' : label;
          },
        },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
    },
    cursor: 'pointer',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Tickets por Cliente
        {chartFilter.cliente && (
          <span className="ml-2 text-blue-500 font-normal text-xs">
            (filtrado: {chartFilter.cliente})
          </span>
        )}
      </h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Clique em uma barra para filtrar
      </p>
    </div>
  );
}
