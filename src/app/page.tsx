'use client';

import { Header } from '@/components/layout/Header';
import { ConfigPanel } from '@/components/layout/ConfigPanel';
import { KpiGrid } from '@/components/kpi/KpiGrid';
import { ChartFilterBar } from '@/components/filters/ChartFilterBar';
import { ClienteChart } from '@/components/charts/ClienteChart';
import { TipoSubtipoChart } from '@/components/charts/TipoSubtipoChart';
import { Heatmap } from '@/components/charts/Heatmap';
import { TicketsTable } from '@/components/table/TicketsTable';
import { KeywordChart } from '@/components/charts/KeywordChart';
import { LoadingBanner } from '@/components/common/LoadingBanner';
import { useDashboardStore } from '@/store/dashboardStore';
import { useTickets } from '@/hooks/useTickets';
import { formatNumber } from '@/utils/format';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';

function DashboardContent() {
  useTickets();

  const isLoading   = useDashboardStore((s) => s.isLoading);
  const tickets     = useDashboardStore((s) => s.tickets);
  const loadedCount = useDashboardStore((s) => s.loadedCount);
  const error       = useDashboardStore((s) => s.error);
  const hasSearched = useDashboardStore((s) => s.hasSearched);

  const showFirstLoadBanner = isLoading && tickets.length === 0;
  const showProgressBanner  = isLoading && tickets.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50">
        <Header />
        <ConfigPanel />
      </div>

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] mx-auto w-full">

        {showFirstLoadBanner && (
          <LoadingBanner message="Buscando tickets no ZenDesk..." />
        )}

        {error && tickets.length === 0 && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {tickets.length > 0 && (
          <>
            <section><KpiGrid /></section>

            <ChartFilterBar />

            <section><KeywordChart /></section>

            {showProgressBanner && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm">
                <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>
                  Carregando mais tickets…{' '}
                  <span className="font-semibold">{formatNumber(loadedCount)}</span> carregados até agora
                </span>
              </div>
            )}

            <section><ClienteChart /></section>
            <section><TipoSubtipoChart /></section>
            <section><Heatmap /></section>
            <section><TicketsTable /></section>
          </>
        )}

        {!isLoading && tickets.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">
              {hasSearched
                ? 'Nenhum ticket encontrado para os filtros selecionados.'
                : 'Selecione o período e clique em Buscar'}
            </p>
            {!hasSearched && (
              <p className="text-gray-400 text-sm max-w-sm">
                Configure os filtros acima e pressione Buscar para carregar os tickets do ZenDesk.
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100">
        ZenDesk Analytics Dashboard · Mercado Eletronico · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, #1e4db7 0%, #0f2860 40%, #071540 100%)' }}
      >
        <svg className="w-8 h-8 animate-spin text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return <DashboardContent />;
}

export default function Page() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
