# Guia de Desenvolvimento

## Comandos Nx principais

```bash
# Build de um projeto
pnpm nx run <projeto>:build

# Servir em desenvolvimento
pnpm nx run <projeto>:serve
# ou
pnpm nx serve <projeto>

# Testes
pnpm nx run <projeto>:test

# Lint
pnpm nx run <projeto>:lint
```

## Testar endpoints do api-gateway

Após `pnpm db:seed` e com o api-gateway rodando (`pnpm dev:gateway`):

```bash
./scripts/test-endpoints.sh
```

Ou manualmente:

```bash
# IDs fixos do seed (Tenant e Partner de demonstração)
TENANT_ID="21a30170-166d-44e3-ac09-b640768dc1c7"
PARTNER_ID="c2989a86-ca61-40f2-9d8a-e6250bde4f9d"

# Criar emissor
curl -X POST http://localhost:3333/v1/issuers \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"partnerId\":\"$PARTNER_ID\",\"name\":\"Test Issuer\"}"

# Criar consumidor
curl -X POST http://localhost:3333/v1/consumers \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"partnerId\":\"$PARTNER_ID\",\"name\":\"Test Consumer\"}"

# Rotacionar credencial de integração
curl -X POST http://localhost:3333/v1/integration-credentials/rotate \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\"}"
```

## Rodar cada app

| App | Comando | Saída |
|-----|---------|-------|
| api-gateway | `pnpm dev:gateway` | http://localhost:3333 |
| orchestration-api | `pnpm dev:orchestration` | http://localhost:3334 |
| user-app (web) | `pnpm dev:user-app` | http://localhost:8081 |
| partner-portal | `pnpm dev:partner-portal` | http://localhost:4200 |

## Workflow típico

1. Criar branch a partir de `main`
2. Fazer alterações
3. Rodar `pnpm nx run <projeto>:build` (e testes se houver)
4. Commit com mensagem descritiva

## Gerar migrations Drizzle

```bash
# 1. Editar schema em libs/infrastructure/drizzle/src/lib/schema.ts
# 2. Gerar migration
pnpm db:generate

# 3. Aplicar
pnpm db:migrate
```

## Adicionar nova lib

```bash
pnpm nx g @nx/js:library <nome> --directory=libs/<categoria>/<nome> --importPath=@ultima-forma/<categoria>-<nome> --no-interactive
```

Exemplo para domain:

```bash
pnpm nx g @nx/js:library partner --directory=libs/domain/partner --importPath=@ultima-forma/domain-partner --no-interactive
```

## Estrutura de pastas por tipo

### NestJS (api-gateway, orchestration-api)

```
apps/<app>/src/
├── main.ts
├── app/
│   ├── app.module.ts
│   ├── app.controller.ts
│   └── *.exception-filter.ts
```

### Expo (user-app)

```
apps/user-app/
├── src/
│   └── app/           # Expo Router (file-based)
│       ├── _layout.tsx
│       └── index.tsx
├── app.json
├── metro.config.js
```

### Vite/React (partner-portal)

```
apps/partner-portal/
├── src/
│   ├── main.tsx
│   └── app/
│       └── app.tsx
├── index.html
└── vite.config.mts
```
