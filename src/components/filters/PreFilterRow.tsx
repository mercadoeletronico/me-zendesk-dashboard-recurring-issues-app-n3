'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

const TIPOS = [
  { value: '',         label: 'Todos os Tipos' },
  { value: 'incident', label: 'Incidente'      },
  { value: 'question', label: 'Dúvida'         },
  { value: 'problem',  label: 'Problema'       },
  { value: 'task',     label: 'Tarefa'         },
];

export function PreFilterRow() {
  const preFilter   = useDashboardStore((s) => s.preFilter);
  const tickets     = useDashboardStore((s) => s.tickets);
  const setPreFilter = useDashboardStore((s) => s.setPreFilter);

  const subtipos = useMemo(() => {
    const set = new Set<string>();
    for (const t of tickets) { if (t.subtipo) set.add(t.subtipo); }
    return Array.from(set).sort();
  }, [tickets]);

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data início</label>
        <input type="date" value={preFilter.dateStart}
          onChange={(e) => setPreFilter({ dateStart: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data fim</label>
        <input type="date" value={preFilter.dateEnd}
          onChange={(e) => setPreFilter({ dateEnd: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo ZenDesk</label>
        <select value={preFilter.tipoZd} onChange={(e) => setPreFilter({ tipoZd: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subtipo</label>
        <select value={preFilter.subtipo} onChange={(e) => setPreFilter({ subtipo: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">Todos os Subtipos</option>
          {subtipos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}
