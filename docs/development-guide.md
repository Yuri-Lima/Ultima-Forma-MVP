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

# Criar solicitação de dados (Sprint 2)
CONSUMER_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
curl -X POST http://localhost:3333/v1/data-requests \
  -H "Content-Type: application/json" \
  -d "{\"consumerId\":\"$CONSUMER_ID\",\"tenantId\":\"$TENANT_ID\",\"purpose\":\"Verificação de identidade\",\"claims\":[\"email\",\"name\"],\"expiresAt\":\"2026-12-31T23:59:59Z\"}"
# Resposta inclui consentUrl para o user-app
```

## Testar com autenticação HMAC (MVP 2.0)

Por padrão (`PARTNER_AUTH_ENABLED=false`), os endpoints `/v1/*` funcionam sem autenticação. Para testar com HMAC habilitado:

1. Gerar chave de criptografia e configurar no `.env`:

```bash
CREDENTIAL_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PARTNER_AUTH_ENABLED=true
```

2. Rotacionar a credencial do parceiro para obter o secret (agora cifrado no servidor):

```bash
curl -X POST http://localhost:3333/v1/integration-credentials/rotate \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\"}"
# Anote o "secret" da resposta
```

3. Gerar assinatura e enviar a requisição:

```bash
SECRET="<secret da rotação>"
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

A assinatura segue a fórmula: `HMAC_SHA256(secret, METHOD + PATH + BODY + TIMESTAMP)`.

## Testar endpoints da Fase 2

```bash
# Revogar consentimento (MVP 2.1)
curl -X POST http://localhost:3333/v1/consents/<consent-id>/revoke \
  -H "Content-Type: application/json" \
  -d '{"revokedBy":"user-123","reason":"User requested revocation"}'

# Histórico de consentimentos por tenant (MVP 2.1)
curl "http://localhost:3333/v1/consents/tenant/$TENANT_ID?limit=10"

# Registrar claim (MVP 2.2)
curl -X POST http://localhost:3333/v1/claims \
  -H "Content-Type: application/json" \
  -d '{"key":"email","namespace":"identity","displayName":"Email Address","sensitivityLevel":"medium"}'

# Dashboard do parceiro (MVP 2.3)
curl "http://localhost:3333/v1/partner/dashboard?partnerId=$PARTNER_ID"

# Health enriquecido (MVP 2.4)
curl http://localhost:3333/health
# Retorna: { status, timestamp, uptimeMs, version, db }

# Readiness check (MVP 2.4)
curl http://localhost:3333/ready

# Métricas Prometheus (MVP 2.4)
curl http://localhost:3333/metrics

# Registrar user subject (MVP 2.5)
curl -X POST http://localhost:3333/v1/subjects \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"externalSubjectRef\":\"ext-user-001\"}"
```

## Rodar cada app

| App | Comando | Saída |
|-----|---------|-------|
| api-gateway | `pnpm dev:gateway` | http://localhost:3333 |
| orchestration-api | `pnpm dev:orchestration` | http://localhost:3334 |
| user-app (web) | `pnpm dev:user-app` | http://localhost:8081 |
| user-app (native / Expo Go) | `pnpm dev:user-app:native` | QR code no terminal |
| user-app (tunnel, redes distintas) | `pnpm dev:user-app:tunnel` | QR code no terminal |
| partner-portal | `pnpm dev:partner-portal` | http://localhost:4200 |
| ops-console | `pnpm dev:ops-console` | http://localhost:4201 |

## Workflow típico

1. Criar branch a partir de `main`
2. Fazer alterações
3. Rodar `pnpm nx run <projeto>:build` (e testes se houver)
4. Commit com mensagem descritiva

## i18n – extrair chaves de tradução

Após adicionar strings traduzíveis com `t('chave')`, extraia as chaves para os arquivos de locale:

```bash
pnpm i18n:extract
```

Isso atualiza os JSON em `libs/shared/i18n/src/locales/`.

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
