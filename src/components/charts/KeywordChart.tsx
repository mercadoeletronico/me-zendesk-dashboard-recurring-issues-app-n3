'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useChartFilter } from '@/hooks/useChartFilter';
import { EmptyState } from '@/components/common/EmptyState';

const STOP = new Set([
  'a','o','as','os','de','da','do','das','dos','e','é','em','na','no','nas','nos',
  'para','com','que','não','nao','um','uma','por','se','ao','mais','mas','já','ja',
  'ou','ser','ter','foi','está','esta','sao','são','tem','seus','suas','seu','sua',
  'me','te','lhe','nos','vos','via','etc','até','ate','sobre','entre','quando',
  'como','muito','num','numa','pelo','pela','pelos','pelas','meu','minha',
  'this','the','is','in','of','to','and','for','with','not','are','has','have',
  'was','it','at','by','an','be','or','on','as','can','but','all','if','we',
  'from','they','been','my','our','so','do','did','no','its','their',
]);

const MIN_LEN = 3;
const MAX_WORDS = 30;

function extractKeywords(subjects: string[]): Array<{ word: string; count: number }> {
  const freq = new Map<string, number>();
  for (const s of subjects) {
    const words = s
      .toLowerCase()
      .replace(/[^\u00C0-\u017Ea-z0-9\s]/g, ' ')
      .split(/\s+/);
    for (const w of words) {
      if (w.length < MIN_LEN || STOP.has(w) || /^\d+$/.test(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_WORDS);
}

function lerpColor(from: string, to: string, t: number): string {
  const f = parseInt(from, 16);
  const e = parseInt(to, 16);
  const r = Math.round(((f >> 16) & 0xff) * (1 - t) + ((e >> 16) & 0xff) * t);
  const g = Math.round(((f >> 8)  & 0xff) * (1 - t) + ((e >> 8)  & 0xff) * t);
  const b = Math.round(( f        & 0xff) * (1 - t) + ( e        & 0xff) * t);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function KeywordChart() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const { chartFilter, handleKeywordClick, setChartFilter } = useChartFilter();

  const keywords = useMemo(() => extractKeywords(tickets.map((t) => t.subject)), [tickets]);

  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Palavras-chave por Título</h3>
        <EmptyState description="Sem dados para o período selecionado." />
      </div>
    );
  }

  const maxCount = keywords[0].count;
  const minCount = keywords[keywords.length - 1].count;
  const range = Math.max(maxCount - minCount, 1);
  const hasSelection = chartFilter.keywords.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Palavras-chave por Título
        </h3>
        <span className="text-xs text-gray-400">
          {keywords.length} palavras · clique para filtrar (múltipla seleção)
        </span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {keywords.map(({ word, count }) => {
          const t = (count - minCount) / range;
          const isActive = chartFilter.keywords.includes(word);
          const fontSize = Math.round(11 + t * 11);

          const bgColor = isActive
            ? '#1d4ed8'
            : lerpColor('bfdbfe', '1d4ed8', t * 0.75);
          const textColor = isActive ? '#ffffff' : (t > 0.5 ? '#ffffff' : '#1e3a8a');

          return (
            <button
              key={word}
              onClick={() => handleKeywordClick(word)}
              title={`"${word}" — ${count} ticket${count !== 1 ? 's' : ''}`}
              style={{
                fontSize: fontSize + 'px',
                backgroundColor: bgColor,
                color: textColor,
                opacity: hasSelection && !isActive ? 0.4 : 1,
                lineHeight: 1.2,
              }}
              className={[
                'px-2.5 py-1 rounded-full font-medium transition-all duration-150',
                'hover:opacity-100 hover:scale-105 select-none cursor-pointer',
                isActive ? 'ring-2 ring-offset-1 ring-blue-400 shadow-md' : '',
              ].join(' ')}
            >
              {word}
              <span
                style={{ fontSize: Math.max(9, fontSize - 4) + 'px', opacity: 0.75 }}
                className="ml-1"
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {hasSelection && (
        <p className="text-xs text-blue-500 mt-3">
          {chartFilter.keywords.length === 1
            ? <>Filtrando por: <strong>"{chartFilter.keywords[0]}"</strong></>
            : <>{chartFilter.keywords.length} palavras selecionadas</>}
          {' · '}
          <button
            onClick={() => setChartFilter({ keywords: [] })}
            className="underline hover:text-blue-700"
          >
            Limpar
          </button>
        </p>
      )}
    </div>
  );
}
