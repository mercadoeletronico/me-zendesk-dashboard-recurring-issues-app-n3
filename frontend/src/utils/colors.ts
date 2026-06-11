// PAL color palette — consistent across all charts
export const PALETTE = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#f43f5e', // rose-500
  '#0ea5e9', // sky-500
];

export function getColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function getPaletteForLabels(labels: string[]): string[] {
  return labels.map((_, i) => getColor(i));
}

// Heatmap color scale: white → blue
export function heatmapColor(value: number, max: number): string {
  if (max === 0) return 'rgb(239, 246, 255)'; // blue-50
  const ratio = Math.min(value / max, 1);
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
    legend: {
      labels: {
        color: '#374151',
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#f9fafb',
      bodyColor: '#e5e7eb',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 10,
    },
  },
};
