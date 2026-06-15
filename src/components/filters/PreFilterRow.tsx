'use client';

import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { SearchInput } from '@/components/common/SearchInput';

const TIPOS = [
  { value: '',         label: 'Todos os Tipos' },
  { value: 'incident', label: 'Incidente'      },
  { value: 'question', label: 'Dúvida'   },
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

  const [subtipoSearch, setSubtipoSearch] = useState('');

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

  const availableOptions = useMemo(
    () => subtipoOptions.filter((o) => !preFilter.subtipos.includes(o)),
    [subtipoOptions, preFilter.subtipos]
  );

  const handleSubtipoSelect = (value: string) => {
    if (!preFilter.subtipos.includes(value)) {
      setPreFilter({ subtipos: [...preFilter.subtipos, value] });
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Data início */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Data início
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
          onChange={(e) => setPreFilter({ tipoZd: e.target.value, subtipos: [] })}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Problema (Subtipo) — multi-seleção */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Problema (Subtipo)
        </label>
        <SearchInput
          value={subtipoSearch}
          onChange={setSubtipoSearch}
          options={availableOptions}
          placeholder="Buscar problema..."
          className="w-64"
          maxSuggestions={10}
          onSelect={handleSubtipoSelect}
        />
      </div>
    </div>
  );
}
