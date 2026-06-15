'use client';

import { useMemo, useState, useCallback } from 'react';
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
import { SearchInput } from '@/components/common/SearchInput';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ClienteChart() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleClienteClick } = useChartFilter();

  const [search, setSearch] = useState('');

  const handleClear = useCallback(() => setSearch(''), []);
  void handleClear; // usado apenas para manter a assinatura — SearchInput ja chama onChange('')

  // Todos os clientes unicos (para sugestoes)
  const allClientes = useMemo(() => {
    const set = new Set<string>();
    for (const t of tickets) { if (t.cliente) set.add(t.cliente); }
    return Array.from(set).sort();
  }, [tickets]);

  // Clientes filtrados pelo search (para o grafico)
  const { labels, data } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      counts.set(t.cliente, (counts.get(t.cliente) ?? 0) + 1);
    }
    const searchLower = search.trim().toLowerCase();
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .filter(([k]) => !searchLower || k.toLowerCase().includes(searchLower))
      .slice(0, 20);
    return {
      labels: sorted.map(([k]) => k),
      data:   sorted.map(([, v]) => v),
    };
  }, [tickets, search]);

  const backgroundColors = labels.map((label, i) => {
    if (chartFilter.cliente && chartFilter.cliente !== label) return `${getColor(i)}55`;
    return getColor(i);
  });

  const chartData = {
    labels,
    datasets: [{
      label: 'Tickets',
      data,
      backgroundColor: backgroundColors,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) handleClienteClick(labels[elements[0].index]);
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
            return label.length > 14 ? label.slice(0, 13) + '\u2026' : label;
          },
        },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Cabecalho */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <h3 className="text-sm font-semibold text-gray-700 shrink-0">
          Tickets por Cliente
          {chartFilter.cliente && (
            <span className="ml-2 text-blue-500 font-normal text-xs">
              (filtrado: {chartFilter.cliente})
            </span>
          )}
        </h3>

        <SearchInput
          value={search}
          onChange={setSearch}
          options={allClientes}
          placeholder="Buscar cliente..."
          className="flex-1 max-w-xs"
        />
      </div>

      {labels.length === 0 ? (
        <EmptyState description={search ? `Nenhum cliente encontrado para "${search}".` : 'Sem dados para o per\u00edodo selecionado.'} />
      ) : (
        <>
          <div className="h-64">
            <Bar data={chartData} options={options} />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Clique em uma barra para filtrar
          </p>
        </>
      )}
    </div>
  );
}
