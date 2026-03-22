# Fase 5 — Platform Scale & Runtime Maturity

## Objetivo

Evoluir a Ultima Forma para uma plataforma **resiliente, escalável e operável** em produção real.

## Versões previstas

| Versão | Nome                        | Status     |
|--------|-----------------------------|------------|
| 5.0    | Async Workflows & Queue Foundations | Em andamento |
| 5.1    | Job Orchestration & Recovery | Planejado  |
| 5.2    | API Contracts & OpenAPI     | Planejado  |
| 5.3    | Horizontal Scaling Readiness | Planejado  |
| 5.4    | Advanced Observability & SRE | Planejado  |
| 5.5    | Delivery, Release & Operations | Planejado  |

## Diretriz principal

**Desacoplar execução, aumentar resiliência e preparar para escala.**

Quando precisar escolher entre adicionar complexidade prematura ou resolver corretamente o fluxo mínimo necessário, escolha sempre:

> Menor implementação útil com alto impacto estrutural.

## Regras obrigatórias

- Manter monorepo Nx
- Manter NestJS
- Manter Drizzle
- Manter arquitetura modular monolith
- Não criar microservices ainda
- Não quebrar APIs existentes
- Não reescrever domínios existentes
- Manter privacy-first
- Manter padrão domain / application / infrastructure

## Documentação por versão

- [MVP 5.0 — Async Workflows & Queue Foundations](mvp-5.0-async-workflows-and-queue-foundations.md)
