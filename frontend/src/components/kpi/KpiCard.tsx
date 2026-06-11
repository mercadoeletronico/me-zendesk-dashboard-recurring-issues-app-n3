interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  subtitleList?: string[]; // renders a scrollable list instead of a single subtitle
  accent?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
  icon?: React.ReactNode;
}

const accentMap = {
  blue:   'border-blue-400',
  green:  'border-emerald-400',
  amber:  'border-amber-400',
  purple: 'border-violet-400',
  rose:   'border-rose-400',
};

const valueColorMap = {
  blue:   'text-blue-700',
  green:  'text-emerald-700',
  amber:  'text-amber-700',
  purple: 'text-violet-700',
  rose:   'text-rose-700',
};

const tagColorMap = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-emerald-100 text-emerald-700',
  amber:  'bg-amber-100 text-amber-700',
  purple: 'bg-violet-100 text-violet-700',
  rose:   'bg-rose-100 text-rose-700',
};

export function KpiCard({ label, value, subtitle, subtitleList, accent = 'blue', icon }: KpiCardProps) {
  const hasList = subtitleList && subtitleList.length > 0;

  return (
    <div
      className={`rounded-xl border-l-4 ${accentMap[accent]} p-4 shadow-sm bg-white flex flex-col gap-1`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{label}</span>
      </div>

      {/* Value */}
      <p className={`text-2xl font-bold tabular-nums ${valueColorMap[accent]}`}>
        {value}
      </p>

      {/* Subtitle or list of tied entries */}
      {hasList ? (
        <div className="mt-1 flex flex-wrap gap-1 max-h-28 overflow-y-auto">
          {subtitleList!.map((item, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full ${tagColorMap[accent]}`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : subtitle ? (
        <p className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</p>
      ) : null}
    </div>
  );
}
