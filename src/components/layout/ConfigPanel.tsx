'use client';

import { BrandSelector } from '@/components/filters/BrandSelector';
import { PreFilterRow } from '@/components/filters/PreFilterRow';
import { useDashboardStore } from '@/store/dashboardStore';

export function ConfigPanel() {
  const isLoading    = useDashboardStore((s) => s.isLoading);
  const commitSearch = useDashboardStore((s) => s.commitSearch);
  const subtipos     = useDashboardStore((s) => s.preFilter.subtipos);
  const setPreFilter = useDashboardStore((s) => s.setPreFilter);

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm flex flex-col gap-3">
      {/* Linha 1: todos os inputs + botão Buscar */}
      <div className="flex flex-wrap items-end gap-4">
        <BrandSelector />
        <PreFilterRow />
        <button
          onClick={commitSearch}
          disabled={isLoading}
          className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60 transition-colors self-end"
          style={{ backgroundColor: '#1a56db' }}
        >
          Buscar
        </button>
      </div>

      {/* Linha 2: chips de problemas selecionados (só quando há seleção) */}
      {subtipos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
            Problemas selecionados:
          </span>
          {subtipos.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
            >
              <span className="max-w-[240px] truncate" title={s}>{s}</span>
              <button
                onClick={() => setPreFilter({ subtipos: subtipos.filter((x) => x !== s) })}
                className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors shrink-0"
                aria-label={"Remover " + s}
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={() => setPreFilter({ subtipos: [] })}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 ml-1"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}
