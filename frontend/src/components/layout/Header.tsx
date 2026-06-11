import { useDashboardStore } from '../../store/dashboardStore';
import { stopSearch } from '../../hooks/useTickets';
import { formatNumber } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

/** Logo: ME brand image + product name text */
function MeLogo() {
  return (
    <div className="flex items-center gap-2 select-none" style={{ lineHeight: 1 }}>
      {/* ME brand mark — swap only the src if the logo ever changes */}
      <img
        src="https://cdn.me.com.br/logos/me_primary.png"
        alt="ME"
        style={{ height: '26px', width: 'auto' }}
      />
      <span
        style={{
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          fontSize: '20px',
          fontWeight: 700,
          color: '#1a1a2e',
          letterSpacing: '-0.4px',
        }}
      >
        ZenDesk
      </span>
      <span
        style={{
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          fontSize: '20px',
          fontWeight: 400,
          color: '#4a5568',
          letterSpacing: '-0.4px',
        }}
      >
        Analytics
      </span>
    </div>
  );
}

export function Header() {
  const tickets = useDashboardStore((s) => s.tickets);
  const loadedCount = useDashboardStore((s) => s.loadedCount);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const error = useDashboardStore((s) => s.error);
  const setLoading = useDashboardStore((s) => s.setLoading);
  const { user, logout } = useAuth();
  const userDisplay = user?.name || user?.email || null;

  function handleStop() {
    stopSearch();
    setLoading(false);
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
      {/* Logo */}
      <MeLogo />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {error && (
          <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            {error}
          </span>
        )}

        {tickets.length > 0 && !isLoading && (
          <span className="text-xs text-gray-400">
            {formatNumber(tickets.length)} tickets
          </span>
        )}

        {isLoading && (
          <>
            <span className="text-xs flex items-center gap-1.5" style={{ color: '#1a56db' }}>
              <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loadedCount > 0 ? `${formatNumber(loadedCount)} tickets` : 'Buscando…'}
            </span>

            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm"
              title="Parar busca e exibir os dados já carregados"
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="10" height="10" rx="1.5" />
              </svg>
              Parar
            </button>
          </>
        )}

        {/* User info + logout */}
        {userDisplay && (
          <>
            <span className="hidden sm:block text-xs text-gray-500 max-w-[160px] truncate" title={userDisplay}>
              {userDisplay}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 hover:text-gray-700 transition-colors"
              title="Sair"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </>
        )}
      </div>
    </header>
  );
}
