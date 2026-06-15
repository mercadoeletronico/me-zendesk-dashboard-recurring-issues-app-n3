'use client';

import { useMemo, useState } from 'react';
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
  const tickets    = useDashboardStore((s) => s.filteredTickets);
  const allTickets = useDashboardStore((s) => s.tickets);
  const { chartFilter, handleClienteClick } = useChartFilter();

  const [search, setSearch] = useState('');

  // Todos os clientes unicos dos tickets brutos (para sugestoes do SearchInput)
  // Usa tickets brutos para que os clientes aparecam mesmo quando ha filtro ativo
  const allClientes = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTickets) { if (t.cliente) set.add(t.cliente); }
    return Array.from(set).sort();
  }, [allTickets]);

  // Contagem de tickets por cliente (a partir de filteredTickets) + filtro por busca
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

  // Barras dimmer quando ha clientes selecionados e o cliente nao e um deles
  const backgroundColors = labels.map((label, i) => {
    if (chartFilter.clientes.length > 0 && !chartFilter.clientes.includes(label)) {
      return `${getColor(i)}55`;
    }
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
            return label.length > 14 ? label.slice(0, 13) + '…' : label;
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
        </h3>

        <SearchInput
          value={search}
          onChange={setSearch}
          options={allClientes}
          placeholder="Buscar cliente..."
          className="flex-1 max-w-xs"
          onSelect={handleClienteClick}
        />
      </div>

      {labels.length === 0 ? (
        <EmptyState description={search ? `Nenhum cliente encontrado para "${search}".` : 'Sem dados para o período selecionado.'} />
      ) : (
        <>
          <div className="h-64">
            <Bar data={chartData} options={options} />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Clique em uma barra ou busque um cliente para filtrar (multipla seleção)
          </p>
        </>
      )}
    </div>
  );
}
