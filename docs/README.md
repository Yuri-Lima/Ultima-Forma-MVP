# Documentação Técnica – Ultima Forma MVP

Guia base para desenvolvedores.

## Índice

- [Arquitetura](architecture.md) – Visão do sistema, apps, libs e boundaries
- [Setup](setup.md) – Instalação e configuração local
- [Guia de desenvolvimento](development-guide.md) – Workflow e comandos
- [Convenções](conventions.md) – Nomes, código e estrutura
- [Glossário](glossary.md) – Termos de domínio e técnicos
- [Troubleshooting](troubleshooting.md) – Problemas comuns e soluções
- [Sprints](sprints.md) – Roadmap do MVP

## Visão geral

A Ultima Forma é uma infraestrutura de identidade portátil privacy-first, com 4 atores:

- **Usuário** – Titular dos dados, aprova ou rejeita solicitações
- **Emissor** – Entidade que emite credenciais
- **Consumidor** – Entidade que solicita dados ao usuário
- **Plataforma Ultima Forma** – Orquestra fluxos, mantém trilha auditável

## Princípios

1. **Privacy-first** – Não armazenar PII bruto como fonte principal
2. **Modular monolith** – Um deploy, domínios separados
3. **Menos módulos, mais conectados** – Evitar scaffolding vazio
4. **Sempre executável** – Todo sprint gera algo testável

## Quick start (5 passos)

1. `pnpm install`
2. `cp .env.example .env`
3. `pnpm db:up`
4. `pnpm db:migrate`
5. `pnpm dev:gateway` e em outro terminal `curl http://localhost:3333/health`
