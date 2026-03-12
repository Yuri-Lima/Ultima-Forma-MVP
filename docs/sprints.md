# Sprints do MVP

## Visão geral

| Sprint | Objetivo principal | Status |
|--------|--------------------|--------|
| 0 | Foundation e base executável | Concluído |
| 1 | Parceiros e fundação de domínio | Concluído |
| 2 | Solicitação de dados e consentimento universal | Concluído |
| 3 | Verificação, confiança e resposta ao consumidor | Concluído |
| 4 | Auditoria e eventos faturáveis | Concluído |
| 4.1 | Sprint 4 – Production-Grade MVP Review | Concluído |
| 5 | Atualização cadastral e webhooks básicos | Pendente |
| 6 | Hardening do MVP | Pendente |

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

- **orchestration-api**
  - CORS habilitado (`enableCors({ origin: true })`) para requisições do ops-console
  - ValidationPipe global com whitelist e transform
  - DTOs de query com class-validator: ListRequestsQueryDto, ListAuditEventsQueryDto (limit 1–100, validação de UUIDs e enums)
  - InternalApiKeyGuard: proteção por `X-API-Key` quando `INTERNAL_API_KEY` está definido (opcional em dev)
- **ApproveConsentUseCase**: checagem defensiva — lança AppError se `dataRequest` for null (evita FK violation)
- **Audit/Billable repositories**: uso de AppError com códigos `AUDIT_APPEND_FAILED` e `BILLABLE_APPEND_FAILED` em vez de Error genérico
- **ops-console**
  - Tratamento de erros: checagem `res.ok`, estado de erro e feedback ao usuário (sem listas vazias silenciosas)
  - Suporte a `VITE_INTERNAL_API_KEY` para enviar X-API-Key em chamadas internas
  - Barrel `components/index.ts` para resolução de módulos
- **Banco de dados**: migration 0004 com índices em audit_events (event_type, aggregate_id, created_at) e billable_events (event_type, tenant_id, data_request_id, created_at)
- **ops-console E2E**: expectativa atualizada de "Welcome" para "Data Requests"
- **.env.example**: documentação de INTERNAL_API_KEY

## Sprint 5 – Atualização cadastral

- ProfileChangeEvent, UpdateNotification
- Webhook básico com retry
- Tela de acompanhamento no ops-console

## Sprint 6 – Hardening

- Limpeza de scaffolding
- Seed, fixtures
- E2E do fluxo crítico
- Rate limit, idempotency, correlation id
- Documentação de endpoints

## O que fica fora do MVP

- Microsserviços
- IA no caminho crítico
- Wallet completa
- Marketplace financeiro
- Next.js como centro da experiência do usuário
- TypeORM
