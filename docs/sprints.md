# Sprints do MVP

## Visao geral

### Fase 1 -- MVP Foundation (Sprints 0-6)

| Sprint | Objetivo principal | Status |
|--------|--------------------|--------|
| 0 | Foundation e base executavel | Concluido |
| 1 | Parceiros e fundacao de dominio | Concluido |
| 2 | Solicitacao de dados e consentimento universal | Concluido |
| 3 | Verificacao, confianca e resposta ao consumidor | Concluido |
| 4 | Auditoria e eventos faturaveis | Concluido |
| 4.1 | Sprint 4 -- Production-Grade MVP Review | Concluido |
| 5 | Atualizacao cadastral e webhooks basicos | Concluido |
| 5.1 | Sprint 5 -- Production-Grade MVP Review | Concluido |
| 6 | Hardening do MVP | Concluido |

### Fase 2 -- Production Readiness (MVP 2.0-2.5)

| Versao | Objetivo principal | Status |
|--------|--------------------|--------|
| 2.0 | Partner API Security | Concluido |
| 2.1 | Consent Governance | Concluido |
| 2.2 | Claims Registry | Concluido |
| 2.3 | Partner Portal Expansion | Concluido |
| 2.4 | Observability | Concluido |
| 2.5 | Wallet Readiness | Concluido |

### MVP 3.0 -- Baseline Closure & Production Foundations

| Item | Objetivo principal | Status |
|------|--------------------|--------|
| 3.0-A | Phase 2 Closure (domain boundaries, subject identity) | Concluido |
| 3.0-B | Production Foundations (config, health, errors, flags) | Concluido |

### Fase 4 -- Product Experience & UX

| Versao | Objetivo principal | Status |
|--------|--------------------|--------|
| 4.0 | Design System & UI Foundations | Concluido |
| 4.1 | Partner Portal UX | Concluido |
| 4.2 | User Consent Experience | Concluido |
| 4.3 | Ops Console Evolution | Concluido |
| 4.4 | API Developer Experience | Concluido |
| 4.5 | UX Hardening | Concluido |

---

## Sprint 0 -- Foundation (concluido)

- Workspace Nx com pnpm
- api-gateway, orchestration-api (NestJS)
- user-app (Expo + Expo Router, iOS/Android/Web)
- partner-portal (React + Vite)
- Libs: shared-config, shared-logger, shared-errors, infrastructure-db, infrastructure-drizzle
- Docker + PostgreSQL
- Drizzle configurado + migration inicial
- GET /health nos backends
- Documentacao em `docs/`

## Sprint 1 -- Parceiros (concluido)

- Libs: domain-partner, application-partner
- Modelos: Partner, Issuer, Consumer, Tenant, IntegrationCredential (schema `core.*`)
- Endpoints: POST /v1/issuers, POST /v1/consumers, POST /v1/integration-credentials/rotate
- Persistencia real com Drizzle (PartnerRepository)
- Secret sempre em hash (SHA-256), nunca em texto puro
- Use cases: CreateIssuer, CreateConsumer, RotateIntegrationCredential
- Seed minimo (1 tenant, 1 partner) via `pnpm db:seed`
- Testes: use cases (unit com mocks) e PartnerRepository (integration)

## Sprint 2 -- Consentimento (concluido)

- Libs: domain-consent, application-consent
- Modelos: DataRequest, RequestItem, Consent, ConsentReceipt (schema `core.*`)
- Endpoints: POST /v1/data-requests, GET /v1/data-requests/:id, POST /v1/data-requests/:id/expire
- Endpoints: POST /v1/consents/:id/approve, POST /v1/consents/:id/reject
- orchestration-api: POST /internal/consents/:id/approve, /reject
- Fluxo de consentimento no user-app (web e mobile): /consent/[requestId]
- Consent receipt auditavel, idempotency key em criacao
- Testes: use cases (unit) e ConsentRepository (integration)

## Sprint 3 -- Verificacao (concluido)

- Domain: TrustLevel, VerificationResult, ReceiptData, DataRequestResultForConsumer
- Verificacao basica de solicitacao: validacao de claims dentro dos scopes do consumer
- Consent receipt com trustLevel e verificationResult (high ao aprovar, low ao rejeitar)
- Endpoint GET /v1/data-requests/:id/result para consumidor obter resultado estruturado
- Use case GetDataRequestResultForConsumerUseCase
- Testes: unit e integration

## Sprint 4 -- Auditoria e billing (concluido)

- Lib domain-audit: tipos AuditEvent, BillableEvent; ports AuditRepositoryPort, BillableEventRepositoryPort
- Schema: audit_events, billable_events (append-only)
- Infrastructure: AuditRepository, BillableEventRepository (drizzle)
- ConsentRepository.listDataRequests com filtros e paginacao
- Integracao nos use cases: CreateDataRequest, ApproveConsent, RejectConsent, ExpireRequest
- orchestration-api: GET /internal/requests, GET /internal/audit-events
- ops-console (React + Vite, porta 4201): rotas /requests e /audit

## Sprint 4.1 -- Production-Grade MVP Review (concluido)

- orchestration-api: CORS, ValidationPipe global, DTOs com class-validator, InternalApiKeyGuard
- ApproveConsentUseCase: checagem defensiva de dataRequest
- Audit/Billable repositories: AppError com codigos especificos
- ops-console: tratamento de erros, suporte a VITE_INTERNAL_API_KEY
- Banco de dados: migration com indices em audit/billable
- .env.example: documentacao de INTERNAL_API_KEY

## Sprint 5 -- Atualizacao cadastral (concluido)

- Lib domain-webhook: ProfileChangeEvent, UpdateNotification, WebhookSubscription, WebhookDelivery, ports
- Schema: webhook_subscriptions, webhook_deliveries
- Infrastructure: WebhookSubscriptionRepository, WebhookDeliveryRepository, WebhookDispatcher (HMAC signing, retry backoff)
- Application: UpdateIssuerUseCase, UpdateConsumerUseCase (audit + webhook dispatch)
- api-gateway: PATCH /v1/issuers/:id, PATCH /v1/consumers/:id
- orchestration-api: GET /internal/webhook-deliveries, WebhookRetryJob (cron a cada minuto)
- ops-console: rotas /profile-updates e /webhooks

## Sprint 5.1 -- Production-Grade MVP Review (concluido)

- ParseUUIDPipe, DTOs com validacao, ValidationPipe com transform
- AppError com codigos especificos nos repositories
- WebhookDispatcher com timeout de 30s
- Migration com indices em webhook_deliveries

## Sprint 6 -- Hardening (concluido)

- Scaffolding cleanup, seed estendido, test-endpoints.sh
- Correlation ID middleware (api-gateway e orchestration-api)
- Rate limit (@nestjs/throttler, 100 req/min)
- Documentacao completa de API endpoints
- E2E smoke tests

---

## MVP 2.0 -- Partner API Security (concluido)

- Schema: migration 0006 -- `encrypted_secret` em `integration_credentials`, tabelas `partner_api_nonces` e `partner_api_usage`
- Domain (domain-partner): tipos `PartnerApiNonce`, `PartnerApiUsage`; port `PartnerSecurityRepositoryPort`
- Application (application-partner): `ValidatePartnerSignatureUseCase` (HMAC SHA-256, timing-safe compare, replay protection), `RegisterPartnerApiUsageUseCase`
- Infrastructure (infrastructure-drizzle): `PartnerSecurityRepository`, `crypto.utils.ts` (AES-256-GCM)
- API Gateway: `PartnerSignatureGuard` com feature flag, `@SkipPartnerAuth()` em endpoints user-facing
- Testes: 10 testes do ValidatePartnerSignature, 6 testes do crypto.utils

## MVP 2.1 -- Consent Governance (concluido)

- Schema: migration 0007 -- tabelas `consent_policies` e `consent_revocations`
- Domain (domain-consent): `ConsentStatus` estendido com `'revoked'`; novos tipos `ConsentPolicy`, `ConsentRevocation`, `ConsentWithDetails`; `ConsentPolicyRepositoryPort`
- Application (application-consent): `RevokeConsentUseCase`, `GetConsentHistoryUseCase`, `GetConsentDetailUseCase`, `ValidateConsentPolicyUseCase`
- Infrastructure: `ConsentPolicyRepository`, `ConsentRepository` estendido
- API: `POST /v1/consents/:id/revoke`, `GET /v1/consents/:id`, `GET /v1/consents/tenant/:tenantId`, `GET /internal/consents`
- Testes: 13 novos testes

## MVP 2.2 -- Claims Registry (concluido)

- Schema: migration 0008 -- tabelas `claim_definitions`, `claim_definition_versions`, `partner_claim_permissions`
- Domain (domain-consent): tipos `ClaimDefinition`, `ClaimDefinitionVersion`, `ClaimPermission`; `ClaimRegistryRepositoryPort`
- Application (application-consent): `RegisterClaimDefinitionUseCase`, `ListClaimDefinitionsUseCase`, `ValidateClaimsAgainstRegistryUseCase`, `AssignClaimPermissionUseCase`
- Infrastructure: `ClaimRegistryRepository`
- API: `POST /v1/claims`, `GET /v1/claims`, `POST /v1/claims/:id/permissions`
- Testes: 7 novos testes

## MVP 2.3 -- Partner Portal Expansion (concluido)

- Domain (domain-partner): `PartnerDashboardMetrics`, `WebhookSubscriptionSummary`; `PartnerDashboardRepositoryPort`
- Application (application-partner): `GetPartnerDashboardUseCase`, `ListPartnerRequestsUseCase`, `ManagePartnerWebhooksUseCase`
- Infrastructure: `PartnerDashboardRepository`
- API: `GET /v1/partner/dashboard`, `GET /v1/partner/requests`, `GET /v1/partner/credentials`, webhooks CRUD
- Testes: 2 dashboard testes

## MVP 2.4 -- Observability (concluido)

- Dependencia: `prom-client` para metricas Prometheus
- Shared (shared-logger): `metrics.ts` com 8 metricas
- API: `GET /health` enriquecido, `GET /ready`, `GET /metrics`
- Interceptor: `MetricsInterceptor` auto-tracks HTTP requests
- Logs: correlation-id middleware enriquecido com campos estruturados

## MVP 2.5 -- Wallet Readiness (concluido)

- Schema: migration 0009 -- tabelas `user_subjects`, `credential_references`, `presentation_sessions`
- Domain (domain-consent): tipos `UserSubject`, `CredentialReference`, `PresentationSession`; `WalletRepositoryPort`
- Application (application-consent): `RegisterUserSubjectUseCase`, `RegisterCredentialReferenceUseCase`, `CreatePresentationSessionUseCase`, `CompletePresentationSessionUseCase`
- Infrastructure: `WalletRepository`
- API: `POST/GET /v1/subjects`, `POST /v1/subjects/:id/credentials`, `POST /v1/presentations`, `POST /v1/presentations/:id/complete`
- Testes: 5 wallet testes

---

## MVP 3.0 -- Baseline Closure & Production Foundations (concluido)

### Block A -- Phase 2 Closure

- **Claims boundary**: extraido de `domain-consent` para `libs/domain/claims` e `libs/application/claims` com 4 use cases proprios. Repository impl permanece em infrastructure-drizzle, importando de `@ultima-forma/domain-claims`. Importe diretamente `@ultima-forma/domain-claims` e `@ultima-forma/application-claims`
- **Wallet boundary**: extraido de `domain-consent` para `libs/domain/wallet` e `libs/application/wallet` com 5 use cases (incluindo `ResolveSubjectUseCase`). Cross-domain dependency: `CreatePresentationSessionUseCase` importa `ConsentRepositoryPort`. Importe diretamente `@ultima-forma/domain-wallet` e `@ultima-forma/application-wallet`
- **Subject identity model**: migration 0010 adiciona `user_subject_id` (FK nullable) em `data_requests`. `WalletRepositoryPort` ganha `findByTenantAndExternalRef(tenantId, externalSubjectRef)`. `ResolveSubjectUseCase` busca ou cria subject por tenant + external ref
- **Observability baseline**: `HealthModule` compartilhado (`libs/shared/health`) com `/health`, `/ready`, `/version`, `/metrics`. Ambos api-gateway e orchestration-api importam o modulo. `MetricsInterceptor` adicionado ao orchestration-api. Request logging com correlationId em ambos os apps. `partnerAuthFailedTotal` devidamente incrementado no guard
- **Partner Portal UI baseline**: decisao documentada -- defer para versao futura. Partner Portal permanece como shell

### Block B -- Production Foundations

- **Config validation (Zod)**: `libs/shared/config/config.ts` reescrito com schema Zod 4. Validacao fail-fast no startup. `z.stringbool()` para feature flags. Guards de producao (encryption key, API key, no localhost). `maskSecret()` e `resetConfigCache()` exportados. 9 testes
- **Health / Ready / Version**: `libs/shared/health` com `HealthModule` e `HealthController`. Endpoints `/health`, `/ready`, `/version`, `/metrics` em ambos os apps. `scripts/generate-build-info.ts` gera `build-info.json` com versao, git commit e timestamp
- **Error standardization**: `AppExceptionFilter` trata `AppError`, `HttpException` e erros desconhecidos com envelope `{ errorCode, message, correlationId, timestamp }`. Enum `ErrorCode` em `libs/shared/errors/src/lib/error-codes.ts`. Aplicado em ambos os apps
- **Feature flags**: `libs/infrastructure/feature-flags` com `FeatureFlagService` e `FeatureFlag` enum (`PARTNER_AUTH`, `CLAIMS_VALIDATION`, `WALLET_PRESENTATIONS`). Env vars com prefixo `FF_`. `PartnerSignatureGuard` migrado para usar `FeatureFlagService`. 3 testes
- **Migration safety**: `scripts/migrate-safe.ts` com logging JSON estruturado, timing e error handling. `pnpm db:migrate:safe`
- **Seed strategy**: `scripts/seed-dev.ts` (fixtures com IDs fixos), `scripts/seed-prod.ts` (bootstrap idempotente). `pnpm db:seed:dev`, `pnpm db:seed:prod`
- **New path aliases**: `@ultima-forma/domain-claims`, `@ultima-forma/application-claims`, `@ultima-forma/domain-wallet`, `@ultima-forma/application-wallet`, `@ultima-forma/shared-health`, `@ultima-forma/infrastructure-feature-flags`
- **Testes**: 24 novos testes (claims: 7, wallet: 5, config: 9, feature-flags: 3). Todos os 70 testes existentes continuam passando. Ambos os apps compilam sem erros de tipo

---

## Fase 4 -- Product Experience & UX (concluido)

Foco: transformar a plataforma em produto utilizavel sem alterar APIs, dominio ou arquitetura backend.

### MVP 4.0 -- Design System & UI Foundations (concluido)

- Lib `libs/shared/design-tokens` (`@ultima-forma/shared-design-tokens`): tokens de cor, spacing, radius, font-size, font-family, shadow, z-index. CSS variables (`tokens.css`) para web com Tailwind v4 `@theme`. Objetos TS para React Native (`nativeTokens.ts`). Dark mode preparado
- Dependencias: Tailwind CSS v4 (`@tailwindcss/vite`), Radix UI (Dialog, Select, Tabs, Toast, Tooltip, Dropdown, Slot), class-variance-authority (CVA), tailwind-merge, clsx
- Lib `libs/shared/ui` (`@ultima-forma/shared-ui`): 10 componentes base (Button, Input, Select, Badge, Modal, Table, Card, Tabs, Alert, Spinner), 5 layout (AppLayout, Sidebar, Topbar, PageContainer, Section), ThemeProvider (light/dark/system), 6 feedback (EmptyState, ErrorState, LoadingState, ErrorBoundary, Skeleton, Toast), hook `useApiQuery`
- Lib `libs/shared/ui-native` (`@ultima-forma/shared-ui-native`): 6 componentes nativos (NativeButton, NativeInput, NativeBadge, NativeCard, NativeAlert, NativeSpinner), 3 feedback (NativeEmptyState, NativeErrorState, NativeLoadingState), NativeErrorBoundary, NativeThemeProvider
- Tailwind configurado em `apps/partner-portal/vite.config.mts` e `apps/ops-console/vite.config.mts`
- Path aliases adicionados em `tsconfig.base.json`

### MVP 4.1 -- Partner Portal UX (concluido)

- Partner-portal transformado de shell vazio para produto com 8 rotas: /login, /dashboard, /requests, /claims, /credentials, /webhooks, /docs, /settings
- Sistema de autenticacao HMAC: login com clientId + clientSecret, signedFetch() com Web Crypto API (SHA-256), credenciais em sessionStorage
- AuthProvider com contexto React, ProtectedRoutes wrapper
- Dashboard: stat cards consumindo `GET /v1/partner/dashboard`
- Requests: tabela com filtros de status, paginacao via `GET /v1/partner/requests`
- Claims: tabela com badges de sensibilidade via `GET /v1/claims`
- Credentials: card layout com acao de rotacao + toast notification
- Webhooks: CRUD completo (list, create via modal, test) + toast notification
- Settings: perfil do parceiro + locale switcher com Radix Select
- Todas as paginas usam shared-ui: PageContainer, Table, Badge, Card, Button, Select, Modal, EmptyState, LoadingState, ErrorState

### MVP 4.2 -- User Consent Experience (concluido)

- Consent flow redesenhado como wizard de 5 passos em `apps/user-app/src/app/consent/[requestId]/index.tsx`
- Step 1: Identificacao do solicitante (consumer name, trust badge, issuer identity)
- Step 2: Proposito e claims (com indicadores de sensibilidade por keyword matching)
- Step 3: Privacidade e termos (expiracao, data usage, link para privacy policy via Linking)
- Step 4: Decisao (resumo + approve/reject com NativeButton)
- Step 5: Confirmacao (substitui approved.tsx/rejected.tsx como step inline)
- Indicador de progresso (dots: verde=completo, azul=ativo, cinza=pendente)
- Navegacao back/next com NativeButton
- Usa componentes de `@ultima-forma/shared-ui-native` com design tokens

### MVP 4.3 -- Ops Console Evolution (concluido)

- Ops-console expandido de 4 para 8 rotas: /requests, /audit, /consents, /webhooks, /partners, /metrics, /system
- AppLayout com Sidebar e Topbar (locale switcher)
- Consents (novo): tabela com filtros tenant/status + acoes approve/reject via `GET /internal/consents`
- Partners (novo): card grid com tenantIds extraidos de requests
- Metrics (novo): parsing de texto Prometheus, exibicao como stat cards
- System (novo): health, version, uptime, feature flags via `GET /health` e `GET /version`
- Audit (refatorado): timeline visual vertical com dots + linha, eventos em Cards, payload JSON expansivel
- Todas as paginas migradas de CSS modules/inline styles para shared-ui components

### MVP 4.4 -- API Developer Experience (concluido)

- Pagina /docs no partner-portal com referencia de 15 endpoints
- Guia de autenticacao HMAC com formula e headers
- Snippets automaticos para cada endpoint em curl, Node.js e Python
- Tabs component (Radix Tabs) para alternar entre linguagens
- CodeBlock component com botao de copia
- Pre-filled com credentials do auth context
- Utility `snippetGenerator.ts` para geracao de curl/node/python

### MVP 4.5 -- UX Hardening (concluido)

- ErrorBoundary: componente classe em shared-ui e shared-ui-native (NativeErrorBoundary), wrapping no root de partner-portal e ops-console
- Skeleton loading: componentes Skeleton, SkeletonTable, SkeletonCard, SkeletonDashboard em shared-ui
- Retry logic: hook `useApiQuery` com retry automatico (3 tentativas, exponential backoff), abort controller, loading/error/data state
- Toast notifications: ToastProvider + useToast() usando Radix Toast, aplicado em rotacao de credenciais e criacao de webhooks
- Empty states: EmptyState tematizado integrado em todas as paginas de dados (requests, consents, claims, webhooks, credentials)

---

## Proxima fase planejada (nao implementada)

### Fase 5 -- Platform Scale

- Async workflows
- Queues e job orchestration
- Event streaming
- Horizontal scaling
- OpenAPI generation

---

## O que fica fora do MVP

- Microsservicos
- IA no caminho critico
- Wallet completa (DID, VC W3C, ZKP)
- Marketplace financeiro
- Next.js como centro da experiencia do usuario
- TypeORM
- Grafana/alerting pre-configurado
- JWT/OAuth token-based auth
- Mutual TLS
- Distributed tracing (OpenTelemetry)
- Database-backed feature flags
- CI/CD pipeline
