# Arquitetura

## Diagrama de alto nivel

```mermaid
flowchart TB
    subgraph apps [Apps]
        apiGW[api-gateway]
        orch[orchestration-api]
        userApp[user-app]
        partner[partner-portal]
        opsConsole[ops-console]
    end

    subgraph libs [Libs]
        config[shared-config]
        logger[shared-logger]
        errors[shared-errors]
        i18n[shared-i18n]
        health[shared-health]
        db[infrastructure-db]
        drizzle[infrastructure-drizzle]
        featureFlags[infrastructure-feature-flags]
        domainPartner[domain-partner]
        appPartner[application-partner]
        domainConsent[domain-consent]
        appConsent[application-consent]
        domainClaims[domain-claims]
        appClaims[application-claims]
        domainWallet[domain-wallet]
        appWallet[application-wallet]
        domainWebhook[domain-webhook]
        domainAudit[domain-audit]
    end

    apiGW --> config
    apiGW --> logger
    apiGW --> errors
    apiGW --> health
    apiGW --> drizzle
    apiGW --> featureFlags
    apiGW --> appPartner
    apiGW --> appConsent
    apiGW --> appClaims
    apiGW --> appWallet
    appPartner --> domainPartner
    appConsent --> domainConsent
    appClaims --> domainClaims
    appWallet --> domainWallet
    appWallet --> domainConsent
    orch --> domainWebhook
    orch --> config
    orch --> logger
    orch --> errors
    orch --> health
    orch --> drizzle
    drizzle --> db
    drizzle --> domainClaims
    drizzle --> domainWallet
```

## Principio de superficies

| Superficie | Descricao | Plataformas |
|------------|-----------|-------------|
| **user-app** | Produto do usuario final | iOS, Android, Web |
| **partner-portal** | Portal para emissores e consumidores | Web |
| **ops-console** | Operacao interna e auditoria | Web |

## Boundaries entre camadas

| Camada | Responsabilidade | Quem pode depender |
|--------|------------------|--------------------|
| **shared** | Config, logger, erros, i18n, metricas, health | Qualquer lib ou app |
| **domain** | Regras de negocio puras | application, interfaces |
| **application** | Use cases, orquestracao | interfaces |
| **infrastructure** | DB, auth, webhooks, feature flags | application |
| **interfaces** | HTTP, mobile, web, SDK | Nenhuma |

**Regra:** Libs de dominio **nao** dependem de NestJS ou framework.

## Domain Boundaries

A plataforma possui 6 dominios independentes:

| Dominio | Lib | Responsabilidade |
|---------|-----|------------------|
| **Partner** | `domain-partner` | Parceiros, issuers, consumers, credentials, dashboard |
| **Consent** | `domain-consent` | Data requests, consentimentos, politicas, receipts |
| **Claims** | `domain-claims` | Definicoes de claims, versionamento, permissoes, sensibilidade |
| **Wallet** | `domain-wallet` | User subjects, credential references, presentation sessions |
| **Audit** | `domain-audit` | Eventos de auditoria, eventos faturaveis |
| **Webhook** | `domain-webhook` | Subscriptions, deliveries, dispatcher |

Claims e Wallet foram extraidos de `domain-consent` no MVP 3.0. Importe diretamente `@ultima-forma/domain-claims`, `@ultima-forma/domain-wallet`, `@ultima-forma/application-claims` e `@ultima-forma/application-wallet`.

## Seguranca de API

O api-gateway suporta autenticacao HMAC SHA-256 para parceiros:

- **PartnerSignatureGuard**: guard NestJS aplicado nas rotas `/v1/*` (exceto endpoints user-facing)
- **Feature flag**: `FF_PARTNER_AUTH` (padrao: `false`) via `FeatureFlagService` permite enforcement gradual
- **Headers**: `X-Partner-Id`, `X-Timestamp`, `X-Signature`
- **Replay protection**: nonces armazenados em `core.partner_api_nonces`
- **Usage tracking**: registrado em `core.partner_api_usage`
- **Criptografia**: secrets com AES-256-GCM; decriptacao na camada de infraestrutura

## Feature Flags

O sistema de feature flags (`libs/infrastructure/feature-flags`) permite controle gradual de funcionalidades:

| Flag | Env Var | Padrao | Descricao |
|------|---------|--------|-----------|
| `PARTNER_AUTH` | `FF_PARTNER_AUTH` | `false` | Autenticacao HMAC para parceiros |
| `CLAIMS_VALIDATION` | `FF_CLAIMS_VALIDATION` | `false` | Validacao de claims no registry |
| `WALLET_PRESENTATIONS` | `FF_WALLET_PRESENTATIONS` | `false` | Endpoints de presentation sessions |

Flags sao lidas de env vars com prefixo `FF_`, validadas pelo schema Zod no startup. O `FeatureFlagService` oferece `isEnabled(flag): boolean`.

## Config Validation

Toda configuracao de ambiente e validada com Zod no startup via `getConfig()`. Se qualquer variavel obrigatoria estiver ausente ou invalida, o processo falha imediatamente com mensagem descritiva. Em producao, validacoes adicionais se aplicam:

- `CREDENTIAL_ENCRYPTION_KEY` obrigatorio
- `INTERNAL_API_KEY` obrigatorio
- `DATABASE_URL` nao pode apontar para localhost

A funcao `maskSecret()` mascara valores sensiveis nos logs.

## Error Standardization

Todas as respostas de erro HTTP seguem o formato padrao:

```json
{
  "errorCode": "CONSENT_NOT_FOUND",
  "message": "The requested consent was not found.",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00.000Z"
}
```

O `AppExceptionFilter` trata tres categorias:
1. **AppError** (erros de dominio) -- mapeia `code` para `errorCode`, resolve mensagem via i18n
2. **HttpException** (NestJS/guards/pipes) -- preserva status, mapeia para `ErrorCode` apropriado
3. **Erros desconhecidos** -- retorna 500 com `INTERNAL_ERROR`, mascara detalhes internos

O enum `ErrorCode` em `libs/shared/errors` oferece constantes tipadas.

## Governanca de consentimento

- **Revogacao**: consentimentos aprovados podem ser revogados (`POST /v1/consents/:id/revoke`)
- **Historico**: listagem por tenant com filtros e paginacao
- **Politicas**: `consent_policies` por tenant com `max_duration_hours` e `allowed_claims`
- **Subject link**: `data_requests` possui FK opcional `user_subject_id` para vinculo explicito com subjects

## Claims Registry

- **Definicoes centralizadas**: `claim_definitions` com key unica, namespace e nivel de sensibilidade
- **Versionamento**: `claim_definition_versions` com JSON Schema por versao
- **Permissoes por parceiro**: `partner_claim_permissions` (issue, consume, both)
- **Validacao**: `ValidateClaimsAgainstRegistryUseCase` verifica existencia e autorizacao

## Wallet

- **User subjects**: identidade portavel com `external_subject_ref` e lookup por `(tenantId, externalSubjectRef)`
- **Subject resolution**: `ResolveSubjectUseCase` busca ou cria subject por tenant + external ref
- **Credential references**: vinculo entre subject, issuer e claim
- **Presentation sessions**: sessao de apresentacao vinculada a data requests
- Base para futuras capacidades de wallet (DID, VC, selective disclosure)

## Observabilidade

Ambos os apps (api-gateway e orchestration-api) possuem:

- **Metricas Prometheus**: `prom-client` com counters e histograms em `/metrics`
- **Health**: `GET /health` com uptime, versao, status de DB
- **Readiness**: `GET /ready` verifica DB e config
- **Version**: `GET /version` retorna versao, git commit, build time, environment
- **MetricsInterceptor**: tracking automatico de HTTP requests
- **Logs estruturados**: correlationId, method, path em cada request

O `HealthModule` (`libs/shared/health`) e compartilhado entre os apps.

## Database Schema (25 tabelas)

Todas no schema `core`:

| Grupo | Tabelas |
|-------|---------|
| Tenants & Partners | `tenants`, `partners`, `issuers`, `consumers`, `integration_credentials` |
| Requests & Consents | `data_requests`, `request_items`, `consents`, `consent_receipts` |
| Consent Governance | `consent_policies`, `consent_revocations` |
| Claims | `claim_definitions`, `claim_definition_versions`, `partner_claim_permissions` |
| Wallet | `user_subjects`, `credential_references`, `presentation_sessions` |
| Audit & Billing | `audit_events`, `billable_events` |
| Webhooks | `webhook_subscriptions`, `webhook_deliveries` |
| Security | `partner_api_nonces`, `partner_api_usage` |

Nota: `data_requests.user_subject_id` e uma FK nullable para `user_subjects.id` (adicionada no MVP 3.0).

## Deployment local

| Componente | Porta | URL |
|------------|-------|-----|
| api-gateway | 3333 | http://localhost:3333 |
| orchestration-api | 3334 | http://localhost:3334 |
| partner-portal | 4200 | http://localhost:4200 |
| ops-console | 4201 | http://localhost:4201 |
| user-app (web) | 8081 | http://localhost:8081 |
| PostgreSQL | 55432 | localhost:55432 |

## Principio de privacidade

A plataforma **nao** armazena como fonte principal: PII bruto (nome completo, CPF, email, etc.)

A plataforma **pode** armazenar: metadados operacionais, logs de consentimento, IDs criptograficos, trilhas de auditoria, configuracoes de parceiros, eventos faturaveis, status de fluxos.

## Internacionalizacao (i18n)

O projeto suporta multiplos idiomas (pt-BR, en, es) com portugues como padrao.

- **shared-i18n** (`libs/shared/i18n`): traducoes em JSON por locale e namespace
- **Frontend:** react-i18next nos apps. O user-app usa `expo-localization`
- **Backend:** nestjs-i18n nos APIs com `Accept-Language`
- **Extracao de chaves:** `pnpm i18n:extract`
