# Sprints do MVP

## Visão geral

### Fase 1 – MVP Foundation (Sprints 0–6)

| Sprint | Objetivo principal | Status |
|--------|--------------------|--------|
| 0 | Foundation e base executável | Concluído |
| 1 | Parceiros e fundação de domínio | Concluído |
| 2 | Solicitação de dados e consentimento universal | Concluído |
| 3 | Verificação, confiança e resposta ao consumidor | Concluído |
| 4 | Auditoria e eventos faturáveis | Concluído |
| 4.1 | Sprint 4 – Production-Grade MVP Review | Concluído |
| 5 | Atualização cadastral e webhooks básicos | Concluído |
| 5.1 | Sprint 5 – Production-Grade MVP Review | Concluído |
| 6 | Hardening do MVP | Concluído |

### Fase 2 – Production Readiness (MVP 2.0–2.5)

| Versão | Objetivo principal | Status |
|--------|--------------------|--------|
| 2.0 | Partner API Security | Concluído |
| 2.1 | Consent Governance | Concluído |
| 2.2 | Claims Registry | Concluído |
| 2.3 | Partner Portal Expansion | Concluído |
| 2.4 | Observability | Concluído |
| 2.5 | Wallet Readiness | Concluído |

---

## Sprint 0 – Foundation (concluído)

- Workspace Nx com pnpm
- api-gateway, orchestration-api (NestJS)
- user-app (Expo + Expo Router, iOS/Android/Web)
- partner-portal (React + Vite)
- Libs: shared-config, shared-logger, shared-errors, infrastructure-db, infrastructure-drizzle
- Docker + PostgreSQL
- Drizzle configurado + migration inicial
- GET /health nos backends
- Documentação em `docs/`

## Sprint 1 – Parceiros (concluído)

- Libs: domain-partner, application-partner
- Modelos: Partner, Issuer, Consumer, Tenant, IntegrationCredential (schema `core.*`)
- Endpoints: POST /v1/issuers, POST /v1/consumers, POST /v1/integration-credentials/rotate
- Persistência real com Drizzle (PartnerRepository)
- Secret sempre em hash (SHA-256), nunca em texto puro
- Use cases: CreateIssuer, CreateConsumer, RotateIntegrationCredential
- Seed mínimo (1 tenant, 1 partner) via `pnpm db:seed`
- Testes: use cases (unit com mocks) e PartnerRepository (integration)

## Sprint 2 – Consentimento (concluído)

- Libs: domain-consent, application-consent
- Modelos: DataRequest, RequestItem, Consent, ConsentReceipt (schema `core.*`)
- Endpoints: POST /v1/data-requests, GET /v1/data-requests/:id, POST /v1/data-requests/:id/expire
- Endpoints: POST /v1/consents/:id/approve, POST /v1/consents/:id/reject
- orchestration-api: POST /internal/consents/:id/approve, /reject
- Fluxo de consentimento no user-app (web e mobile): /consent/[requestId]
- Consent receipt auditável, idempotency key em criação
- Testes: use cases (unit) e ConsentRepository (integration)

## Sprint 3 – Verificação (concluído)

- Domain: TrustLevel, VerificationResult, ReceiptData, DataRequestResultForConsumer
- Verificação básica de solicitação: validação de claims dentro dos scopes do consumer
- Consent receipt com trustLevel e verificationResult (high ao aprovar, low ao rejeitar)
- Endpoint GET /v1/data-requests/:id/result para consumidor obter resultado estruturado
- Use case GetDataRequestResultForConsumerUseCase
- Testes: unit (CreateDataRequest CLAIMS_OUT_OF_SCOPE, GetDataRequestResultForConsumer), integration (ConsentRepository receipt structure)

## Sprint 4 – Auditoria e billing (concluído)

- Lib domain-audit: tipos AuditEvent, BillableEvent; ports AuditRepositoryPort, BillableEventRepositoryPort
- Schema: audit_events, billable_events (append-only)
- Infrastructure: AuditRepository, BillableEventRepository (drizzle)
- ConsentRepository.listDataRequests com filtros e paginação
- Integração nos use cases: CreateDataRequest (request_created), ApproveConsent (consent_granted audit + billable), RejectConsent (consent_rejected), ExpireRequest (request_expired)
- orchestration-api: GET /internal/requests, GET /internal/audit-events
- ops-console (React + Vite, porta 4201): rotas /requests e /audit

## Sprint 4.1 – Production-Grade MVP Review (concluído)

- **orchestration-api**: CORS, ValidationPipe global, DTOs com class-validator, InternalApiKeyGuard
- **ApproveConsentUseCase**: checagem defensiva de dataRequest
- **Audit/Billable repositories**: AppError com códigos específicos
- **ops-console**: tratamento de erros, suporte a VITE_INTERNAL_API_KEY, barrel exports
- **Banco de dados**: migration 0004 com índices em audit/billable
- **.env.example**: documentação de INTERNAL_API_KEY

## Sprint 5 – Atualização cadastral (concluído)

- **Lib domain-webhook**: ProfileChangeEvent, UpdateNotification, WebhookSubscription, WebhookDelivery, ports
- **Schema**: webhook_subscriptions, webhook_deliveries (migration 0004_mean_romulus); índices em migration 0005
- **Infrastructure**: WebhookSubscriptionRepository, WebhookDeliveryRepository, WebhookDispatcher (HMAC signing, retry backoff 1–16min)
- **Application**: UpdateIssuerUseCase, UpdateConsumerUseCase (audit + webhook dispatch)
- **api-gateway**: PATCH /v1/issuers/:id, PATCH /v1/consumers/:id
- **orchestration-api**: GET /internal/webhook-deliveries, WebhookRetryJob (cron a cada minuto)
- **ops-console**: rotas /profile-updates e /webhooks

## Sprint 5.1 – Production-Grade MVP Review (concluído)

- ParseUUIDPipe, DTOs com validação, ValidationPipe com transform
- AppError com códigos específicos nos repositories
- WebhookDispatcher com timeout de 30s
- WebhookRetryJob com logging de erros
- Migration 0005 com índices em webhook_deliveries

## Sprint 6 – Hardening (concluído)

- Scaffolding cleanup, seed estendido, test-endpoints.sh
- Correlation ID middleware (api-gateway e orchestration-api)
- Rate limit (@nestjs/throttler, 100 req/min)
- Documentação completa de API endpoints
- E2E smoke tests

---

## MVP 2.0 – Partner API Security (concluído)

- **Schema**: migration 0006 — `encrypted_secret` em `integration_credentials`, tabelas `partner_api_nonces` e `partner_api_usage`
- **Domain (domain-partner)**: tipos `PartnerApiNonce`, `PartnerApiUsage`; port `PartnerSecurityRepositoryPort`
- **Application (application-partner)**: `ValidatePartnerSignatureUseCase` (HMAC SHA-256, timing-safe compare, replay protection), `RegisterPartnerApiUsageUseCase`
- **Infrastructure (infrastructure-drizzle)**: `PartnerSecurityRepository`, `crypto.utils.ts` (AES-256-GCM), `PartnerRepository` atualizado
- **API Gateway**: `PartnerSignatureGuard` com feature flag `PARTNER_AUTH_ENABLED`, `@SkipPartnerAuth()` em endpoints user-facing
- **Config**: `credentialEncryptionKey`, `partnerAuthEnabled`, `partnerAuthTimestampToleranceMs`
- **Testes**: 10 testes do ValidatePartnerSignature, 6 testes do crypto.utils
- **Compatibilidade**: `PARTNER_AUTH_ENABLED=false` por padrão

## MVP 2.1 – Consent Governance (concluído)

- **Schema**: migration 0007 — tabelas `consent_policies` e `consent_revocations`
- **Domain (domain-consent)**: `ConsentStatus` estendido com `'revoked'`; novos tipos `ConsentPolicy`, `ConsentRevocation`, `ConsentWithDetails`; `ConsentPolicyRepositoryPort`; `ConsentRepositoryPort` estendido com `revokeConsent` e `listConsentsByTenant`
- **Application (application-consent)**: `RevokeConsentUseCase` (valida estado, cria revocação, audit trail), `GetConsentHistoryUseCase` (paginação por tenant), `GetConsentDetailUseCase`, `ValidateConsentPolicyUseCase` (max_duration_hours, allowed_claims)
- **Infrastructure**: `ConsentPolicyRepository`, `ConsentRepository` estendido com revogação e listagem
- **API**: `POST /v1/consents/:id/revoke`, `GET /v1/consents/:id`, `GET /v1/consents/tenant/:tenantId`, `GET /internal/consents`
- **Audit**: novo evento `consent_revoked`
- **Testes**: 5 revoke, 5 policy, 3 history = 13 novos testes

## MVP 2.2 – Claims Registry (concluído)

- **Schema**: migration 0008 — tabelas `claim_definitions`, `claim_definition_versions`, `partner_claim_permissions`
- **Domain (domain-consent)**: tipos `ClaimDefinition`, `ClaimDefinitionVersion`, `ClaimPermission`; `ClaimRegistryRepositoryPort`
- **Application (application-consent)**: `RegisterClaimDefinitionUseCase`, `ListClaimDefinitionsUseCase`, `ValidateClaimsAgainstRegistryUseCase`, `AssignClaimPermissionUseCase`
- **Infrastructure**: `ClaimRegistryRepository` com CRUD completo e findClaimsByKeys
- **API**: `POST /v1/claims`, `GET /v1/claims`, `POST /v1/claims/:id/permissions`
- **Testes**: 3 register, 4 validate = 7 novos testes

## MVP 2.3 – Partner Portal Expansion (concluído)

- **Domain (domain-partner)**: `PartnerDashboardMetrics`, `WebhookSubscriptionSummary`, `CreateWebhookInput`, `UpdateWebhookInput`; `PartnerDashboardRepositoryPort`
- **Application (application-partner)**: `GetPartnerDashboardUseCase`, `ListPartnerRequestsUseCase`, `ManagePartnerWebhooksUseCase`
- **Infrastructure**: `PartnerDashboardRepository` com queries agregadas
- **API**: `GET /v1/partner/dashboard`, `GET /v1/partner/requests`, `GET /v1/partner/credentials`, `POST /v1/partner/credentials/rotate`, `GET/POST/PATCH /v1/partner/webhooks`
- **Testes**: 2 dashboard testes

## MVP 2.4 – Observability (concluído)

- **Dependência**: `prom-client` para métricas Prometheus
- **Shared (shared-logger)**: `metrics.ts` com 8 métricas — `http_requests_total`, `http_request_duration_ms`, `data_requests_created_total`, `consents_approved/rejected/revoked_total`, `webhook_delivery_failed_total`, `partner_auth_failed_total`
- **API**: `GET /health` enriquecido (uptime, version, status degraded), `GET /ready` (readiness check), `GET /metrics` (Prometheus)
- **Interceptor**: `MetricsInterceptor` auto-tracks HTTP requests (method, path, status, duration)
- **Logs**: `correlation-id.middleware.ts` enriquecido com campos estruturados (correlationId, method, path, partnerId)

## MVP 2.5 – Wallet Readiness (concluído)

- **Schema**: migration 0009 — tabelas `user_subjects`, `credential_references`, `presentation_sessions`
- **Domain (domain-consent)**: tipos `UserSubject`, `CredentialReference`, `PresentationSession`; `WalletRepositoryPort`
- **Application (application-consent)**: `RegisterUserSubjectUseCase`, `RegisterCredentialReferenceUseCase`, `CreatePresentationSessionUseCase`, `CompletePresentationSessionUseCase`
- **Infrastructure**: `WalletRepository`
- **API**: `POST/GET /v1/subjects`, `POST /v1/subjects/:id/credentials`, `POST /v1/presentations`, `POST /v1/presentations/:id/complete`
- **Testes**: 5 wallet testes (subject, credential, session create/complete, duplicate rejection)

---

## O que fica fora do MVP

- Microsserviços
- IA no caminho crítico
- Wallet completa (DID, VC W3C, ZKP)
- Marketplace financeiro
- Next.js como centro da experiência do usuário
- TypeORM
- Grafana/alerting pré-configurado
- JWT/OAuth token-based auth
- Mutual TLS
