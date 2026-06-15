'use client';

import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useChartFilter } from '@/hooks/useChartFilter';
import { heatmapColor } from '@/utils/colors';
import { EmptyState } from '@/components/common/EmptyState';

interface HeatmapData {
  subtipos: string[];
  dates: string[];
  cells: Map<string, number>;
  maxCount: number;
}

function buildHeatmapData(tickets: { subtipo: string; data: string }[]): HeatmapData {
  const cells = new Map<string, number>();
  const subtipoSet = new Set<string>();
  const dateSet = new Set<string>();

  for (const t of tickets) {
    subtipoSet.add(t.subtipo);
    dateSet.add(t.data);
    const key = `${t.subtipo}||${t.data}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }

  const subtipos = Array.from(subtipoSet).sort();
  const dates = Array.from(dateSet).sort();
  const maxCount = Math.max(...Array.from(cells.values()), 1);

  return { subtipos, dates, cells, maxCount };
}

// Group dates by YYYY-MM
function groupByMonth(dates: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const d of dates) {
    const month = d.slice(0, 7);
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(d);
  }
  return map;
}

const PT_MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${PT_MONTHS[parseInt(month, 10) - 1]}/${year.slice(2)}`;
}

export function Heatmap() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleHeatmapClick } = useChartFilter();

  const heatmapData = useMemo(() => buildHeatmapData(tickets), [tickets]);
  const monthGroups = useMemo(() => groupByMonth(heatmapData.dates), [heatmapData.dates]);
  const months = useMemo(() => Array.from(monthGroups.keys()).sort(), [monthGroups]);

  const [activeMonth, setActiveMonth] = useState<string>(() => months[months.length - 1] ?? '');
  const currentMonth = months.includes(activeMonth) ? activeMonth : (months[months.length - 1] ?? '');

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Heatmap de Tickets por Problema (Subtipo)</h3>
        <EmptyState description="Sem dados para o período selecionado." />
      </div>
    );
  }

  const datesForMonth = monthGroups.get(currentMonth) ?? [];
  const { subtipos, cells, maxCount } = heatmapData;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Heatmap de Tickets por Problema (Subtipo)</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-block w-4 h-4 rounded" style={{ background: heatmapColor(0, 10) }} />
          <span>0</span>
          <span className="inline-block w-4 h-4 rounded" style={{ background: heatmapColor(5, 10) }} />
          <span>meio</span>
          <span className="inline-block w-4 h-4 rounded" style={{ background: heatmapColor(10, 10) }} />
          <span>max ({maxCount})</span>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setActiveMonth(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              m === currentMonth
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={m === currentMonth ? { backgroundColor: '#1a56db' } : undefined}
          >
            {monthLabel(m)}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate" style={{ borderSpacing: '2px' }}>
          <thead>
            <tr>
              <th className="text-left text-gray-500 font-medium p-1 min-w-[140px]">Subtipo</th>
              {datesForMonth.map((d) => (
                <th key={d} className="text-center text-gray-400 font-normal p-1 min-w-[28px]">
                  {d.slice(8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subtipos.map((subtipo) => (
              <tr key={subtipo}>
                <td
                  className="text-gray-600 font-medium p-1 truncate max-w-[160px]"
                  title={subtipo}
                >
                  {subtipo}
                </td>
                {datesForMonth.map((data) => {
                  const count = cells.get(`${subtipo}||${data}`) ?? 0;
                  const isActive =
                    chartFilter.heatmap?.subtipo === subtipo &&
                    chartFilter.heatmap?.data === data;
                  return (
                    <td
                      key={data}
                      onClick={() => count > 0 && handleHeatmapClick(subtipo, data)}
                      title={count > 0 ? `${subtipo} · ${data}: ${count} tickets` : undefined}
                      className={`text-center rounded transition-all p-1 ${
                        count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                      } ${isActive ? 'ring-2 ring-blue-500' : ''}`}
                      style={{
                        background: heatmapColor(count, maxCount),
                        color: count / maxCount > 0.5 ? '#fff' : '#374151',
                        fontWeight: count > 0 ? 600 : 400,
                        minWidth: '28px',
                        height: '28px',
                      }}
                    >
                      {count > 0 ? count : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        Clique em uma célula para filtrar · Agrupado por subtipo
      </p>
    </div>
  );
}
