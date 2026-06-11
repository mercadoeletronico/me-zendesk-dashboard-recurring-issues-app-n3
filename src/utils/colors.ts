export const PALETTE = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#84cc16','#ec4899','#6366f1',
  '#14b8a6','#a855f7','#eab308','#22c55e','#f43f5e','#0ea5e9',
];

export function getColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function getPaletteForLabels(labels: string[]): string[] {
  return labels.map((_, i) => getColor(i));
}

export function heatmapColor(value: number, max: number): string {
  if (max === 0) return 'rgb(239, 246, 255)';
  const ratio     = Math.min(value / max, 1);
  const intensity = Math.round(ratio * 200);
  const r = 239 - intensity;
  const g = 246 - intensity;
  const b = 255;
  return `rgb(${Math.max(r, 30)}, ${Math.max(g, 30)}, ${b})`;
}

export const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#374151', font: { size: 12 } } },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#f9fafb',
      bodyColor:  '#e5e7eb',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 10,
    },
  },
};
