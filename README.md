# Ultima Forma MVP

Infraestrutura de identidade portátil privacy-first.

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL local)

## Setup local

```bash
# 1. Instalar dependências
pnpm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Subir PostgreSQL
pnpm db:up

# 4. Rodar migrations
pnpm db:migrate:safe

# 5. (Opcional) Verificar build
pnpm nx run-many -t build -p api-gateway orchestration-api partner-portal ops-console
pnpm nx run user-app:export
```

## Comandos principais

| Comando | Descrição |
|---------|-----------|
| `pnpm db:up` | Sobe PostgreSQL via Docker |
| `pnpm db:down` | Para PostgreSQL |
| `pnpm db:migrate:safe` | Aplica migrations com logging estruturado |
| `pnpm db:generate` | Gera nova migration a partir do schema |
| `pnpm dev:gateway` | Sobe API Gateway (porta 3333) |
| `pnpm dev:orchestration` | Sobe Orchestration API (porta 3334) |
| `pnpm dev:user-app` | Sobe user-app em modo web |
| `pnpm dev:partner-portal` | Sobe Partner Portal (porta 4200) |
| `pnpm dev:ops-console` | Sobe Ops Console (porta 4201) |
| `pnpm dev:all` | Sobe todos os apps em paralelo |

## Apps

- **api-gateway** -- Gateway público NestJS (porta 3333)
- **orchestration-api** -- APIs internas NestJS (porta 3334)
- **user-app** -- App universal Expo + Expo Router (iOS, Android, Web)
- **partner-portal** -- Portal web para parceiros (React + Vite + Tailwind, porta 4200). Login com HMAC, dashboard, requests, claims, credentials, webhooks, API docs, settings
- **ops-console** -- Console operacional (React + Vite + Tailwind, porta 4201). Requests, audit timeline, consents, webhooks, partners, metrics, system health

## Shared UI Libraries

- **@ultima-forma/shared-design-tokens** -- Design tokens (colors, spacing, radius, fonts, shadows, z-index) para web (CSS variables) e React Native
- **@ultima-forma/shared-ui** -- Componentes React DOM (Button, Input, Select, Badge, Modal, Table, Card, Tabs, Alert, Spinner) + layout (AppLayout, Sidebar, Topbar) + feedback (ErrorBoundary, Skeleton, Toast, EmptyState, ErrorState, LoadingState) + ThemeProvider com dark mode
- **@ultima-forma/shared-ui-native** -- Componentes React Native equivalentes + NativeThemeProvider

## Documentação

Consulte [docs/](docs/) para:

- [Arquitetura](docs/architecture.md)
- [Setup detalhado](docs/setup.md)
- [Guia de desenvolvimento](docs/development-guide.md)
- [Convenções](docs/conventions.md)
- [Glossário](docs/glossary.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Sprints do MVP](docs/sprints.md)

## Verificação rápida

```bash
# Health check (com DB rodando)
curl http://localhost:3333/health
```
