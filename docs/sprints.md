# Sprints do MVP

## Visão geral

| Sprint | Objetivo principal | Status |
|--------|--------------------|--------|
| 0 | Foundation e base executável | Concluído |
| 1 | Parceiros e fundação de domínio | Concluído |
| 2 | Solicitação de dados e consentimento universal | Pendente |
| 3 | Verificação, confiança e resposta ao consumidor | Pendente |
| 4 | Auditoria e eventos faturáveis | Pendente |
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

## Sprint 2 – Consentimento

- DataRequest, RequestItem, Consent, ConsentReceipt
- Fluxo de aprovação/rejeição no user-app (web e mobile)
- POST /v1/data-requests, GET /v1/data-requests/:id
- Trilha auditável mínima

## Sprint 3 – Verificação

- TrustLevel, VerificationResult
- Verificação básica de solicitação
- Retorno estruturado ao consumidor

## Sprint 4 – Auditoria e billing

- AuditEvent, BillableEvent (append-only)
- ops-console com /requests e /audit
- Eventos: request_created, consent_granted, etc.

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
