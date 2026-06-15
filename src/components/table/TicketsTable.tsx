'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useDashboardStore } from '@/store/dashboardStore';
import { Ticket } from '@/types';
import { formatDate } from '@/utils/format';
import { EmptyState } from '@/components/common/EmptyState';

const PAGE_SIZE = 15;

// 'tempo' e uma chave virtual calculada, nao existe em Ticket
type SortableKey = keyof Ticket | 'tempo';
interface SortConfig { key: SortableKey; direction: 'asc' | 'desc'; }

const STATUS_FECHADO = new Set(['Resolvido', 'Fechado', 'solved', 'closed']);

function calcHoras(ticket: Ticket): number {
  const start = ticket.createdAt
    ? new Date(ticket.createdAt).getTime()
    : new Date(ticket.data).getTime();
  const isClosed = STATUS_FECHADO.has(ticket.status);
  const end = isClosed && ticket.updatedAt
    ? new Date(ticket.updatedAt).getTime()
    : Date.now();
  const h = Math.round((end - start) / 3_600_000);
  return h < 0 ? 0 : h;
}

function formatHoras(h: number): string {
  if (h < 24) return h + 'h';
  const d = Math.floor(h / 24);
  const r = h % 24;
  return r > 0 ? d + 'd ' + r + 'h' : d + 'd';
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (!direction) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="ml-1" style={{ color: '#1a56db' }}>{direction === 'asc' ? '↑' : '↓'}</span>;
}

function exportToExcel(tickets: Ticket[]) {
  const rows = tickets.map((t) => ({
    'ID':       t.id,
    'Data':     formatDate(t.data),
    'Cliente':  t.cliente,
    'Tipo':     t.tipo,
    'Subtipo':  t.subtipo,
    'Título':   t.subject,
    'Marca':    t.brand,
    'Status':   t.status,
    'Tempo (h)': calcHoras(t),
    'Link':     `https://mercadoe.zendesk.com/agent/tickets/${t.id}`,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 35 }, { wch: 14 },
    { wch: 40 }, { wch: 60 }, { wch: 16 }, { wch: 10 },
    { wch: 10 }, { wch: 55 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
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

  const tipos = useMemo(() => Array.from(new Set(tickets.map((t) => t.tipo))).sort(), [tickets]);
  const clientes = useMemo(() => Array.from(new Set(tickets.map((t) => t.cliente))).sort(), [tickets]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter((t) => {
      if (tipoFilter && t.tipo !== tipoFilter) return false;
      if (clienteFilter && t.cliente !== clienteFilter) return false;
      if (term) {
        const hay = `${t.id} ${t.subject} ${t.cliente} ${t.tipo} ${t.subtipo} ${t.brand} ${t.status}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [tickets, search, tipoFilter, clienteFilter]);

  const sorted = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (key === 'tempo') {
        cmp = calcHoras(a) - calcHoras(b);
      } else {
        const av = a[key as keyof Ticket];
        const bv = b[key as keyof Ticket];
        if (typeof av === 'number' && typeof bv === 'number') {
          cmp = av - bv;
        } else {
          cmp = String(av).localeCompare(String(bv), 'pt-BR');
        }
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

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Aberto:    'bg-green-100 text-green-700',
      Pendente:  'bg-yellow-100 text-yellow-700',
      Resolvido: 'bg-gray-100 text-gray-600',
      Fechado:   'bg-red-100 text-red-600',
      'Em Espera': 'bg-orange-100 text-orange-700',
      Novo:      'bg-blue-100 text-blue-700',
      open: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      solved: 'bg-gray-100 text-gray-600',
      closed: 'bg-red-100 text-red-600',
      hold: 'bg-orange-100 text-orange-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  };

  const cols: Array<{ key: SortableKey; label: string; className?: string; tooltip?: string }> = [
    { key: 'id',      label: 'ID',       className: 'w-20' },
    { key: 'data',    label: 'Data',     className: 'w-28' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'tipo',    label: 'Tipo',     className: 'w-24' },
    { key: 'subtipo', label: 'Problema' },
    { key: 'subject', label: 'Título' },
    { key: 'brand',   label: 'Marca',    className: 'w-28' },
    { key: 'status',  label: 'Status',   className: 'w-24' },
    { key: 'tempo',   label: 'Tempo',    className: 'w-24', tooltip: 'Tempo em horas aberto' },
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

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 w-48"
          style={{ '--tw-ring-color': '#1a56db' } as React.CSSProperties}
        />

        <select value={tipoFilter} onChange={(e) => { setTipoFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2">
          <option value="">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={clienteFilter} onChange={(e) => { setClienteFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 max-w-[180px]">
          <option value="">Todos os clientes</option>
          {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {sorted.length > 0 && (
          <button onClick={() => exportToExcel(sorted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors shadow-sm"
            style={{ backgroundColor: '#1a56db' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1648c8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a56db'; }}
            title={`Exportar ${sorted.length} tickets para Excel`}
          >
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
                      title={col.tooltip}
                      className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 transition-colors ${col.className ?? ''}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {col.tooltip && (
                        <span className="ml-1 text-gray-300 text-[9px] align-super normal-case font-normal">?</span>
                      )}
                      <SortIcon direction={sortConfig.key === col.key ? sortConfig.direction : null} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageTickets.map((ticket) => {
                  const horas = calcHoras(ticket);
                  const isClosed = STATUS_FECHADO.has(ticket.status);
                  const tempoColor = isClosed
                    ? 'text-gray-400'
                    : horas > 72 ? 'text-rose-600 font-bold'
                    : horas > 24 ? 'text-amber-600 font-semibold'
                    : 'text-gray-600';

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-xs">
                        <a href={`https://mercadoe.zendesk.com/agent/tickets/${ticket.id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:opacity-75 transition-opacity"
                          style={{ color: '#1a56db' }}>
                          #{ticket.id}
                        </a>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(ticket.data)}</td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium max-w-[180px] truncate" title={ticket.cliente}>
                        {ticket.cliente}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{ticket.tipo}</td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate" title={ticket.subtipo}>
                        {ticket.subtipo}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[260px] truncate" title={ticket.subject}>
                        {ticket.subject}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{ticket.brand}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2.5 whitespace-nowrap text-xs ${tempoColor}`}
                        title={isClosed
                          ? `Resolvido em ${horas}h (abertura até resolução)`
                          : `Aberto há ${horas}h (em andamento)`}
                      >
                        {formatHoras(horas)}
                        {!isClosed && <span className="ml-0.5 text-[9px] text-gray-400 align-super">●</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Página {page + 1} de {totalPages} · {filtered.length} tickets
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(0)} disabled={page === 0}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">«</button>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">‹</button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">›</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                  className="px-2 py-1 rounded border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">»</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
