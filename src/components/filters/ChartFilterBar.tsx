'use client';

import { useChartFilter } from '@/hooks/useChartFilter';

function Chip({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
      <span className="text-blue-500 text-xs uppercase tracking-wide">{label}:</span>
      <span>{value}</span>
      <button onClick={onRemove}
        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
        aria-label={`Remover filtro ${label}`}>
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

export function ChartFilterBar() {
  const { chartFilter, hasActiveFilter, clearChartFilter, setChartFilter, clearChartFilterKey } = useChartFilter();

  if (!hasActiveFilter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
      <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide mr-1">Filtros ativos:</span>

      {/* Um chip por cliente selecionado */}
      {chartFilter.clientes.map((cliente) => (
        <Chip
          key={cliente}
          label="Cliente"
          value={cliente}
          onRemove={() =>
            setChartFilter({ clientes: chartFilter.clientes.filter((c) => c !== cliente) })
          }
        />
      ))}

      {chartFilter.keywords.map((kw) => (
        <Chip key={kw} label="Palavra-chave" value={kw}
          onRemove={() => setChartFilter({ keywords: chartFilter.keywords.filter((k) => k !== kw) })} />
      ))}
      {chartFilter.tipo    && <Chip label="Tipo"    value={chartFilter.tipo}    onRemove={() => clearChartFilterKey('tipo')}    />}
      {chartFilter.subtipo && <Chip label="Subtipo" value={chartFilter.subtipo} onRemove={() => clearChartFilterKey('subtipo')} />}
      {chartFilter.heatmap && (
        <Chip label="Heatmap" value={`${chartFilter.heatmap.subtipo} · ${chartFilter.heatmap.data}`}
          onRemove={() => clearChartFilterKey('heatmap')} />
      )}

      <button onClick={clearChartFilter}
        className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2">
        Limpar tudo
      </button>
    </div>
  );
}
