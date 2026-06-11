'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useDashboardStore } from '@/store/dashboardStore';
import { Ticket, SortConfig } from '@/types';
import { formatDate } from '@/utils/format';
import { EmptyState } from '@/components/common/EmptyState';

const PAGE_SIZE = 15;

type SortableKey = keyof Ticket;

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (!direction) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="ml-1" style={{ color: '#1a56db' }}>{direction === 'asc' ? '↑' : '↓'}</span>;
}

/** Gera e faz download do arquivo Excel com os tickets filtrados */
function exportToExcel(tickets: Ticket[]) {
  const rows = tickets.map((t) => ({
    'ID':          t.id,
    'Data':        formatDate(t.data),
    'Cliente':     t.cliente,
    'Tipo':        t.tipo,
    'Subtipo':     t.subtipo,
    'Marca':       t.brand,
    'Status':      t.status,
    'Recorrência': t.recorrencia,
    'Link':        `https://mercadoe.zendesk.com/agent/tickets/${t.id}`,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Larguras de coluna
  ws['!cols'] = [
    { wch: 10 },  // ID
    { wch: 12 },  // Data
    { wch: 35 },  // Cliente
    { wch: 14 },  // Tipo
    { wch: 40 },  // Subtipo
    { wch: 16 },  // Marca
    { wch: 10 },  // Status
    { wch: 12 },  // Recorrência
    { wch: 55 },  // Link
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tickets');

  // Nome do arquivo com data/hora
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  XLSX.writeFile(wb, `zendesk_tickets_${stamp}.xlsx`);
}

export function TicketsTable() {
  const tickets = useDashboardStore((s) => s.filteredTickets);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'data', direction: 'desc' });
  const [tipoFilter, setTipoFilter] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');

  // Dropdown options derived from current tickets
  const tipos = useMemo(() => {
    const set = new Set(tickets.map((t) => t.tipo));
    return Array.from(set).sort();
  }, [tickets]);

  const clientes = useMemo(() => {
    const set = new Set(tickets.map((t) => t.cliente));
    return Array.from(set).sort();
  }, [tickets]);

  // Filter + search
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter((t) => {
      if (tipoFilter && t.tipo !== tipoFilter) return false;
      if (clienteFilter && t.cliente !== clienteFilter) return false;
      if (term) {
        const haystack = `${t.id} ${t.subject} ${t.cliente} ${t.tipo} ${t.subtipo} ${t.brand} ${t.status}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [tickets, search, tipoFilter, clienteFilter]);

  // Sort
  const sorted = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), 'pt-BR');
      }
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageTickets = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortableKey) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
    setPage(0);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      solved: 'bg-gray-100 text-gray-600',
      closed: 'bg-red-100 text-red-600',
      hold: 'bg-orange-100 text-orange-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  };

  const cols: Array<{ key: SortableKey; label: string; className?: string }> = [
    { key: 'id', label: 'ID', className: 'w-20' },
    { key: 'data', label: 'Data', className: 'w-28' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'tipo', label: 'Tipo', className: 'w-24' },
    { key: 'subtipo', label: 'Subtipo' },
    { key: 'brand', label: 'Marca', className: 'w-28' },
    { key: 'status', label: 'Status', className: 'w-24' },
    { key: 'recorrencia', label: 'Recor.', className: 'w-16 text-center' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mr-auto">
          Detalhamento de Tickets
          <span className="ml-2 text-gray-400 font-normal text-xs">
            ({filtered.length} de {tickets.length})
          </span>
        </h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 w-48"
          style={{ '--tw-ring-color': '#1a56db' } as React.CSSProperties}
        />

        {/* Tipo dropdown */}
        <select
          value={tipoFilter}
          onChange={(e) => { setTipoFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
        >
          <option value="">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Cliente dropdown */}
        <select
          value={clienteFilter}
          onChange={(e) => { setClienteFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 max-w-[180px]"
        >
          <option value="">Todos os clientes</option>
          {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Export button — exports all filtered+sorted rows, not just current page */}
        {sorted.length > 0 && (
          <button
            onClick={() => exportToExcel(sorted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors shadow-sm"
            style={{ backgroundColor: '#1a56db' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1648c8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a56db'; }}
            title={`Exportar ${sorted.length} tickets para Excel`}
          >
            {/* Download/spreadsheet icon */}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar Excel
          </button>
        )}
      </div>

      {pageTickets.length === 0 ? (
        <EmptyState description="Nenhum ticket encontrado com os filtros atuais." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 transition-colors ${col.className ?? ''}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <SortIcon direction={sortConfig.key === col.key ? sortConfig.direction : null} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs">
                      <a
                        href={`https://mercadoe.zendesk.com/agent/tickets/${ticket.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:opacity-75 transition-opacity"
                        style={{ color: '#1a56db' }}
                      >
                        #{ticket.id}
                      </a>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                      {formatDate(ticket.data)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-800 font-medium max-w-[180px] truncate" title={ticket.cliente}>
                      {ticket.cliente}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{ticket.tipo}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate" title={ticket.subtipo}>
                      {ticket.subtipo}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{ticket.brand}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`font-bold ${ticket.recorrencia > 2 ? 'text-rose-500' : 'text-gray-500'}`}>
                        {ticket.recorrencia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Página {page + 1} de {totalPages} · {filtered.length} tickets
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  «
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ›
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
