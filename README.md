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
pnpm db:migrate

# 5. (Opcional) Verificar build
pnpm nx run-many -t build -p api-gateway orchestration-api partner-portal
pnpm nx run user-app:export
```

## Comandos principais

| Comando | Descrição |
|---------|-----------|
| `pnpm db:up` | Sobe PostgreSQL via Docker |
| `pnpm db:down` | Para PostgreSQL |
| `pnpm db:migrate` | Aplica migrations Drizzle |
| `pnpm db:generate` | Gera nova migration a partir do schema |
| `pnpm dev:gateway` | Sobe API Gateway (porta 3333) |
| `pnpm dev:orchestration` | Sobe Orchestration API (porta 3334) |
| `pnpm dev:user-app` | Sobe user-app em modo web |
| `pnpm dev:partner-portal` | Sobe Partner Portal (porta 4200) |

## Apps

- **api-gateway** – Gateway público NestJS (GET /health)
- **orchestration-api** – APIs internas NestJS (GET /health)
- **user-app** – App universal Expo + Expo Router (iOS, Android, Web)
- **partner-portal** – Portal web para parceiros (React + Vite)

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
