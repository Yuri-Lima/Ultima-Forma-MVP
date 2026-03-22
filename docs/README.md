# Documentacao Tecnica -- Ultima Forma MVP

Guia base para desenvolvedores.

## Indice

- [Arquitetura](architecture.md) -- Visao do sistema, apps, libs e boundaries
- [Setup](setup.md) -- Instalacao e configuracao local
- [Guia de desenvolvimento](development-guide.md) -- Workflow e comandos
- [API Endpoints](api-endpoints.md) -- Referencia dos endpoints
- [Convenções](conventions.md) -- Nomes, codigo e estrutura
- [Glossario](glossary.md) -- Termos de dominio e tecnicos
- [Troubleshooting](troubleshooting.md) -- Problemas comuns e solucoes
- [Sprints](sprints.md) -- Roadmap completo (Fase 1, Fase 2, MVP 3.0 e Fase 4)
- [Fase 5](phase-5/README.md) -- Platform Scale & Runtime Maturity (async queues, BullMQ)

## Visao geral

A Ultima Forma e uma infraestrutura de identidade portavel privacy-first, com 4 atores:

- **Usuario** -- Titular dos dados, aprova ou rejeita solicitacoes
- **Emissor** -- Entidade que emite credenciais
- **Consumidor** -- Entidade que solicita dados ao usuario
- **Plataforma Ultima Forma** -- Orquestra fluxos, mantem trilha auditavel

## Principios

1. **Privacy-first** -- Nao armazenar PII bruto como fonte principal
2. **Modular monolith** -- Um deploy, dominios separados
3. **Menos modulos, mais conectados** -- Evitar scaffolding vazio
4. **Sempre executavel** -- Todo sprint gera algo testavel
5. **Production-grade foundations** -- Config validada, erros padronizados, observabilidade em todos os apps

## Quick start (6 passos)

1. `pnpm install`
2. `cp .env.example .env`
3. `pnpm db:up`
4. `pnpm db:migrate:safe`
5. `pnpm db:seed` -- cria tenant e partner de demonstracao
6. `pnpm dev:gateway` e em outro terminal `pnpm test:api` (ou `curl http://localhost:3333/health`)

## Inicio rapido (tudo de uma vez)

```bash
pnpm install
cp .env.example .env
pnpm dev:all
```

O comando `dev:all` gera build-info, aplica migrations com logging estruturado, executa seed, extrai i18n e sobe todos os apps em paralelo.
