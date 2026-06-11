import { useDashboardStore } from '../../store/dashboardStore';

const BRANDS = [
  { value: '', label: 'Todas as Marcas' },
  { value: 'ME Buyers', label: 'ME Buyers' },
  { value: 'ME Suppliers', label: 'ME Suppliers' },
];

export function BrandSelector() {
  const brand = useDashboardStore((s) => s.preFilter.brand);
  const setPreFilter = useDashboardStore((s) => s.setPreFilter);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Marca
      </label>
      <select
        value={brand}
        onChange={(e) => setPreFilter({ brand: e.target.value })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {BRANDS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>
    </div>
  );
}
