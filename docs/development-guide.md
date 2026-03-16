# Guia de Desenvolvimento

## Comandos Nx principais

```bash
pnpm nx run <projeto>:build    # Build de um projeto
pnpm nx run <projeto>:serve    # Servir em desenvolvimento
pnpm nx run <projeto>:test     # Testes
pnpm nx run <projeto>:lint     # Lint
```

## Testar endpoints do api-gateway

Apos `pnpm db:seed` e com o api-gateway rodando (`pnpm dev:gateway`):

```bash
./scripts/test-endpoints.sh
```

Ou manualmente:

```bash
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

# Rotacionar credencial de integracao
curl -X POST http://localhost:3333/v1/integration-credentials/rotate \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\"}"

# Criar solicitacao de dados
CONSUMER_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
curl -X POST http://localhost:3333/v1/data-requests \
  -H "Content-Type: application/json" \
  -d "{\"consumerId\":\"$CONSUMER_ID\",\"tenantId\":\"$TENANT_ID\",\"purpose\":\"Verificacao de identidade\",\"claims\":[\"email\",\"name\"],\"expiresAt\":\"2026-12-31T23:59:59Z\"}"
```

## Testar com autenticacao HMAC

Por padrao (`FF_PARTNER_AUTH=false`), os endpoints `/v1/*` funcionam sem autenticacao. Para testar com HMAC habilitado:

1. Configurar no `.env`:

```bash
CREDENTIAL_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
FF_PARTNER_AUTH=true
```

2. Rotacionar a credencial do parceiro para obter o secret:

```bash
curl -X POST http://localhost:3333/v1/integration-credentials/rotate \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\"}"
```

3. Gerar assinatura e enviar a requisicao:

```bash
SECRET="<secret da rotacao>"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
METHOD="POST"
PATH_URL="/v1/issuers"
BODY="{\"tenantId\":\"$TENANT_ID\",\"partnerId\":\"$PARTNER_ID\",\"name\":\"Test\"}"
PAYLOAD="${METHOD}${PATH_URL}${BODY}${TIMESTAMP}"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -X $METHOD "http://localhost:3333${PATH_URL}" \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: $PARTNER_ID" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Signature: $SIGNATURE" \
  -d "$BODY"
```

## Testar endpoints operacionais

```bash
# Health (processo vivo, DB check)
curl http://localhost:3333/health

# Readiness (DB + config valida)
curl http://localhost:3333/ready

# Version (versao, git commit, build time, environment)
curl http://localhost:3333/version

# Metricas Prometheus
curl http://localhost:3333/metrics

# orchestration-api tambem tem todos esses endpoints
curl http://localhost:3334/health
curl http://localhost:3334/ready
curl http://localhost:3334/version
curl http://localhost:3334/metrics
```

## Testar endpoints da Fase 2

```bash
# Revogar consentimento
curl -X POST http://localhost:3333/v1/consents/<consent-id>/revoke \
  -H "Content-Type: application/json" \
  -d '{"revokedBy":"user-123","reason":"User requested revocation"}'

# Historico de consentimentos por tenant
curl "http://localhost:3333/v1/consents/tenant/$TENANT_ID?limit=10"

# Registrar claim
curl -X POST http://localhost:3333/v1/claims \
  -H "Content-Type: application/json" \
  -d '{"key":"email","namespace":"identity","displayName":"Email Address","sensitivityLevel":"medium"}'

# Dashboard do parceiro
curl "http://localhost:3333/v1/partner/dashboard?partnerId=$PARTNER_ID"

# Registrar user subject
curl -X POST http://localhost:3333/v1/subjects \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"externalSubjectRef\":\"ext-user-001\"}"
```

## Rodar cada app

| App | Comando | Saida |
|-----|---------|-------|
| api-gateway | `pnpm dev:gateway` | http://localhost:3333 |
| orchestration-api | `pnpm dev:orchestration` | http://localhost:3334 |
| user-app (web) | `pnpm dev:user-app` | http://localhost:8081 |
| user-app (native / Expo Go) | `pnpm dev:user-app:native` | QR code no terminal |
| user-app (tunnel) | `pnpm dev:user-app:tunnel` | QR code no terminal |
| partner-portal | `pnpm dev:partner-portal` | http://localhost:4200 |
| ops-console | `pnpm dev:ops-console` | http://localhost:4201 |
| **Todos** | `pnpm dev:all` | Todos os acima em paralelo |

O `dev:all` automaticamente: gera build-info, aplica migrations seguras, executa seed, extrai i18n e sobe todos os apps.

## Workflow tipico

1. Criar branch a partir de `main`
2. Fazer alteracoes
3. Rodar `pnpm nx run <projeto>:build` (e testes se houver)
4. Commit com mensagem descritiva

## i18n -- extrair chaves de traducao

```bash
pnpm i18n:extract
```

## Gerar migrations Drizzle

```bash
# 1. Editar schema em libs/infrastructure/drizzle/src/lib/schema.ts
# 2. Gerar migration
pnpm db:generate
# 3. Aplicar com logging estruturado
pnpm db:migrate:safe
```

## Adicionar nova lib

```bash
pnpm nx g @nx/js:library <nome> --directory=libs/<categoria>/<nome> --importPath=@ultima-forma/<categoria>-<nome> --no-interactive
```

Apos criar, adicionar o path alias em `tsconfig.base.json`.

## Estrutura de libs por dominio

| Path Alias | Diretorio | Descricao |
|------------|-----------|-----------|
| `@ultima-forma/domain-partner` | `libs/domain/partner` | Tipos e ports de parceiros |
| `@ultima-forma/domain-consent` | `libs/domain/consent` | Tipos e ports de consentimento |
| `@ultima-forma/domain-claims` | `libs/domain/claims` | Tipos e ports de claims |
| `@ultima-forma/domain-wallet` | `libs/domain/wallet` | Tipos e ports de wallet |
| `@ultima-forma/domain-audit` | `libs/domain/audit` | Tipos e ports de auditoria |
| `@ultima-forma/domain-webhook` | `libs/domain/webhook` | Tipos e ports de webhooks |
| `@ultima-forma/application-partner` | `libs/application/partner` | Use cases de parceiros |
| `@ultima-forma/application-consent` | `libs/application/consent` | Use cases de consentimento |
| `@ultima-forma/application-claims` | `libs/application/claims` | Use cases de claims |
| `@ultima-forma/application-wallet` | `libs/application/wallet` | Use cases de wallet |
| `@ultima-forma/shared-config` | `libs/shared/config` | Config com validacao Zod |
| `@ultima-forma/shared-logger` | `libs/shared/logger` | Logger + metricas Prometheus |
| `@ultima-forma/shared-errors` | `libs/shared/errors` | AppError + ErrorCode enum |
| `@ultima-forma/shared-health` | `libs/shared/health` | HealthModule (health/ready/version/metrics) |
| `@ultima-forma/shared-i18n` | `libs/shared/i18n` | Traducoes i18n |
| `@ultima-forma/infrastructure-drizzle` | `libs/infrastructure/drizzle` | Schema Drizzle + repositories |
| `@ultima-forma/infrastructure-db` | `libs/infrastructure/db` | Pool de conexao |
| `@ultima-forma/infrastructure-feature-flags` | `libs/infrastructure/feature-flags` | FeatureFlagService |

## Estrutura de pastas por tipo

### NestJS (api-gateway, orchestration-api)

```
apps/<app>/src/
├── main.ts
├── app/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.exception-filter.ts
│   └── metrics.interceptor.ts
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

### Vite/React (partner-portal, ops-console)

```
apps/<app>/
├── src/
│   ├── main.tsx
│   └── app/
│       └── app.tsx
├── index.html
└── vite.config.mts
```
