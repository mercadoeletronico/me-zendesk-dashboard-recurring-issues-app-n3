# ZenDesk Analytics Dashboard

Dashboard fullstack para análise de tickets ZenDesk, com backend Node.js/TypeScript e frontend React/TypeScript.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, react-chartjs-2, Zustand, TanStack Query |
| Backend | Node.js, TypeScript, Express, Axios, Helmet, express-rate-limit |
| Proxy | n8n webhook → ZenDesk Export API (cursor pagination) |

## Estrutura

```
me-zendesk-dashboard-recurring-issues-app/
├── backend/              Node.js API (porta 3001)
│   └── src/
│       ├── config/       Validação de env com Zod
│       ├── middleware/   Error handler + request logger
│       ├── routes/       POST /api/tickets
│       ├── services/     n8n proxy + paginação cursor
│       └── types/        Tipos compartilhados
└── frontend/             React SPA (porta 5173)
    └── src/
        ├── components/   Header, KPIs, Gráficos, Heatmap, Tabela, Filtros
        ├── hooks/        useTickets (TanStack Query), useChartFilter
        ├── services/     fetch wrapper para o backend
        ├── store/        Zustand: tickets, chartFilter, preFilter
        ├── types/        Ticket, ChartFilter, PreFilter, KpiData
        └── utils/        recorrencia, colors, format
```

## Setup Local

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais ZenDesk e URL do n8n
npm install
npm run dev
# Servidor em http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App em http://localhost:5173
```

### 3. Verificar saúde do backend

```bash
curl http://localhost:3001/health
# {"status":"ok","timestamp":"..."}
```

## Variáveis de Ambiente (Backend)

Copie `backend/.env.example` para `backend/.env` e preencha:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do servidor (default: 3001) |
| `N8N_WEBHOOK_URL` | URL do webhook n8n que proxy a API ZenDesk |
| `ZD_SUBDOMAIN` | Subdomínio ZenDesk (ex: `mercadoe`) |
| `ZD_EMAIL` | E-mail do agente ZenDesk |
| `ZD_TOKEN` | API token ZenDesk |
| `CORS_ORIGIN` | Origem permitida pelo CORS (default: `http://localhost:5173`) |

## Docker Compose

```bash
cp backend/.env.example backend/.env
# Edite backend/.env

docker-compose up --build
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

## API

### POST /api/tickets

**Request body:**
```json
{
  "dateStart": "2024-01-01",
  "dateEnd": "2024-01-31",
  "brand": "ME Buyers",
  "tipoFilter": "incident",
  "subtipoFilter": ""
}
```

**Response:**
```json
{
  "tickets": [
    {
      "id": 123456,
      "subject": "Erro ao fazer pedido",
      "cliente": "ACME Corp",
      "tipo": "Incidente",
      "subtipo": "Erro no sistema",
      "brand": "ME Buyers",
      "status": "open",
      "data": "2024-01-15",
      "dayOfMonth": 15,
      "recorrencia": 3
    }
  ],
  "brands": ["ME Buyers", "ME Suppliers"]
}
```

## Funcionalidades

- **KPIs**: Total de tickets, Clientes ativos, Subtipo mais frequente, Maior recorrência geral e por cliente
- **Gráfico Clientes**: Top 20 clientes por volume, click-to-filter
- **Gráfico Tipo**: Doughnut por tipo (Incidente/Dúvida/Problema/Tarefa), click-to-filter
- **Gráfico Subtipo**: Barras horizontais top 15, click-to-filter
- **Heatmap**: Tickets por subtipo × dia, agrupado por mês com tabs, click-to-filter
- **Tabela**: 15/página, ordenação por coluna, busca livre, filtros dropdown por tipo e cliente
- **ChartFilterBar**: Chips removíveis para cada filtro de gráfico ativo
- **Recorrência**: Calculada como distinct dates por (cliente, subtipo)

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `npm run build` | Build de produção |
| `npm run typecheck` | Verificação de tipos TypeScript |
| `npm run lint` | Linting ESLint |
