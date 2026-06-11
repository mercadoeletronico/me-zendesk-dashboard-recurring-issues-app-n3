import { BrandSelector } from '../filters/BrandSelector';
import { PreFilterRow } from '../filters/PreFilterRow';
import { useDashboardStore } from '../../store/dashboardStore';

export function ConfigPanel() {
  const isLoading = useDashboardStore((s) => s.isLoading);
  const commitSearch = useDashboardStore((s) => s.commitSearch);

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
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
    </div>
  );
}
