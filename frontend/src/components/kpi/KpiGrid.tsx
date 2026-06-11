import { useMemo } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { computeKpis } from '../../utils/recorrencia';
import { formatNumber } from '../../utils/format';
import { KpiCard } from './KpiCard';

export function KpiGrid() {
  const tickets = useDashboardStore((s) => s.filteredTickets);
  const kpis = useMemo(() => computeKpis(tickets), [tickets]);

  const geralDias = kpis.maiorRecorrenciaGeral?.dias ?? 0;
  const geralSubtipos = kpis.maiorRecorrenciaGeral?.subtipos ?? [];

  const cliRec = kpis.maiorRecorrenciaCliente?.recorrencia ?? 0;
  const cliEntries = (kpis.maiorRecorrenciaCliente?.entries ?? []).map(
    (e) => `${e.cliente} · ${e.subtipo}`
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Total de Tickets"
        value={formatNumber(kpis.total)}
        accent="blue"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        }
      />
      <KpiCard
        label="Clientes Ativos"
        value={formatNumber(kpis.clientesAtivos)}
        accent="green"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        }
      />
      <KpiCard
        label="Subtipo Mais Frequente"
        value={`${formatNumber(kpis.subtipoMaisFrequenteCount)} tickets`}
        subtitleList={kpis.subtipoMaisFrequente !== '—' ? [kpis.subtipoMaisFrequente] : []}
        accent="amber"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
      <KpiCard
        label="Maior Recorrência (Geral)"
        value={`${geralDias} dias`}
        subtitleList={geralSubtipos}
        accent="purple"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      />
      <KpiCard
        label="Maior Recorrência por Cliente"
        value={`${cliRec} dias`}
        subtitleList={cliEntries}
        accent="rose"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />
    </div>
  );
}
