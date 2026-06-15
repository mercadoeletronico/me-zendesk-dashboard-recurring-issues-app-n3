'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { SearchInput } from '@/components/common/SearchInput';

const TIPOS = [
  { value: '',         label: 'Todos os Tipos' },
  { value: 'incident', label: 'Incidente'      },
  { value: 'question', label: 'D\u00favida'   },
  { value: 'problem',  label: 'Problema'       },
  { value: 'task',     label: 'Tarefa'         },
];

const TIPO_ZD_PT: Record<string, string> = {
  incident: 'Incidente',
  question: 'Duvida',
  problem:  'Problema',
  task:     'Tarefa',
};

export function PreFilterRow() {
  const preFilter    = useDashboardStore((s) => s.preFilter);
  const tickets      = useDashboardStore((s) => s.tickets);
  const setPreFilter = useDashboardStore((s) => s.setPreFilter);

  // Subtipos unicos filtrados por brand e tipo (para sugestoes)
  const subtipoOptions = useMemo(() => {
    const tipoPT = preFilter.tipoZd ? (TIPO_ZD_PT[preFilter.tipoZd] ?? '') : '';
    const set = new Set<string>();
    for (const t of tickets) {
      if (preFilter.brand && t.brand !== preFilter.brand) continue;
      if (tipoPT && t.tipo !== tipoPT) continue;
      if (t.subtipo && t.subtipo !== '-') set.add(t.subtipo);
    }
    return Array.from(set).sort();
  }, [tickets, preFilter.brand, preFilter.tipoZd]);

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Data inicio */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Data in\u00edcio
        </label>
        <input
          type="date"
          value={preFilter.dateStart}
          onChange={(e) => setPreFilter({ dateStart: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Data fim */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Data fim
        </label>
        <input
          type="date"
          value={preFilter.dateEnd}
          onChange={(e) => setPreFilter({ dateEnd: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Tipo ZenDesk */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Tipo ZenDesk
        </label>
        <select
          value={preFilter.tipoZd}
          onChange={(e) => setPreFilter({ tipoZd: e.target.value, subtipo: '' })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Subtipo — search input com sugestoes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Subtipo
        </label>
        <SearchInput
          value={preFilter.subtipo}
          onChange={(v) => setPreFilter({ subtipo: v })}
          options={subtipoOptions}
          placeholder="Buscar subtipo..."
          className="w-56"
          maxSuggestions={10}
        />
      </div>
    </div>
  );
}
