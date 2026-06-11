import { useAuth } from '../context/AuthContext';

/** 4-color Microsoft Windows logo SVG */
function WindowsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

export function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #1e4db7 0%, #0f2860 40%, #071540 100%)',
      }}
    >
      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full flex flex-col items-center gap-6"
        style={{ maxWidth: '400px' }}
      >
        {/* ME logo */}
        <img
          src="https://cdn.me.com.br/logos/me_primary.png"
          alt="Mercado Eletronico"
          style={{ height: '36px', width: 'auto' }}
        />

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">ZenDesk Analytics · Mercado Eletronico</p>
        </div>

        {/* Microsoft button */}
        <button
          onClick={login}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ letterSpacing: '0.01em' }}
        >
          <WindowsIcon />
          <span>Microsoft</span>
        </button>

        {isLoading && (
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Autenticando…
          </p>
        )}
      </div>

      {/* Footer */}
      <p className="text-white/40 text-xs mt-8">
        © {new Date().getFullYear()} Mercado Eletronico · Acesso restrito a colaboradores
      </p>
    </div>
  );
}
