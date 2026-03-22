# MVP 5.0 — Async Workflows & Queue Foundations

## Objetivo

Introduzir execução assíncrona controlada na plataforma com **BullMQ** e **Redis**.

## Por que BullMQ?

- Opção moderna e ativamente desenvolvida para filas no ecossistema Bull/NestJS
- Usa **Redis** como backend persistente de jobs
- Suporta workers separados, retries, delayed jobs, eventos e flows
- Funciona bem com múltiplos processos e escala horizontal futura
- Bull (legado) está em maintenance mode; NestJS recomenda BullMQ

## Arquitetura

### Producers vs Consumers

| App              | Papel                    | Responsabilidade                                      |
|------------------|--------------------------|--------------------------------------------------------|
| **api-gateway**  | Producer                 | Enfileira `webhook.delivery` ao atualizar issuer/consumer |
| **orchestration-api** | Producer (para cenários futuros) | Enfileira jobs internos                          |
| **worker**       | Consumer / Processor     | Consome filas, executa HTTP delivery, atualiza status  |

### Queues iniciais

| Queue             | Job types            | Concorrência padrão |
|-------------------|----------------------|----------------------|
| `webhooks`        | `webhook.delivery`, `webhook.retry` | 5                    |
| `notifications`   | `notification.dispatch` | 3                 |
| `audit-projections` | `audit.projection` | 2                    |

### Retry policy

- **Tentativas:** 5
- **Backoff:** exponencial (`type: 'exponential'`, `delay: 5000`)
- **removeOnComplete:** 1000 (mantém últimos 1000 jobs completos)
- **removeOnFail:** 5000 (mantém últimos 5000 jobs falhos para inspeção)

### Dead-letter policy (MVP mínimo)

Quando um job excede o número máximo de tentativas:

1. `QueueEventsService` marca o delivery em `webhook_deliveries` como `failed`
2. Registra evento de audit (`webhook_delivery_dead_letter`)
3. Job permanece no conjunto de falhos do BullMQ para inspeção
4. Não há UI de DLQ nesta versão (MVP 5.1)

## Setup local

### Redis

O `docker-compose` inclui Redis. Suba a infraestrutura completa:

```bash
pnpm infra:up   # ou pnpm db:up (que inclui Redis a partir do MVP 5.0)
```

Redis roda em `localhost:6388` por padrão.

### Variáveis de ambiente (novas)

| Variável                  | Padrão        | Descrição                           |
|---------------------------|---------------|-------------------------------------|
| `REDIS_HOST`              | localhost     | Host do Redis                       |
| `REDIS_PORT`              | 6379          | Porta do Redis                      |
| `REDIS_PASSWORD`          | *(opcional)*  | Senha do Redis                      |
| `REDIS_DB`                | 0             | Índice do banco Redis               |
| `QUEUE_PREFIX`            | ultima-forma  | Prefixo das chaves Redis            |
| `QUEUE_WEBHOOK_CONCURRENCY`   | 5  | Concorrência do processor webhooks |
| `QUEUE_NOTIFICATION_CONCURRENCY` | 3  | Concorrência do processor notifications |

### Rodar o worker

```bash
pnpm dev:worker
```

O worker expõe os mesmos health endpoints (`/health`, `/ready`, `/version`) na porta 3335 por padrão.

### Rodar tudo

```bash
pnpm dev:all
```

Inclui api-gateway, orchestration-api, worker, user-app, partner-portal e ops-console.

## Fluxo webhook assíncrono

```
PATCH /v1/issuers/:id
  → UpdateIssuerUseCase
  → AsyncWebhookDispatcher.dispatch()
      → Cria delivery em webhook_deliveries (status=pending)
      → Enfileira job webhook.delivery em BullMQ
  → HTTP 200 retorna imediatamente

Worker:
  → WebhookProcessor consome job
  → Busca delivery e subscription
  → Executa HTTP POST com HMAC
  → Atualiza status (succeeded ou failed)
  → Em falha: BullMQ retenta automaticamente
  → Após 5 falhas: dead-letter + audit log
```

## Troubleshooting de queue/Redis

### Redis não conecta

- Verifique se o container está rodando: `docker ps | grep redis`
- Teste: `redis-cli -h localhost -p 6388 ping` → deve retornar `PONG`

### Jobs não são processados

- Verifique se o worker está rodando: `curl http://localhost:3335/health`
- Verifique logs do worker por erros de conexão Redis
- Use `redis-cli` e inspecione chaves com prefixo `ultima-forma:*`

### Webhook continua falhando após 5 tentativas

- O delivery é marcado como `failed` em `webhook_deliveries`
- Um evento `webhook_delivery_dead_letter` é registrado em audit
- Para retry manual, use `EnqueueWebhookRetryJobUseCase` (MVP 5.1 terá UI no ops-console)

### Métricas

O worker expõe `/metrics` (Prometheus) com:

- `queue_jobs_enqueued_total`
- `queue_jobs_completed_total`
- `queue_jobs_failed_total`
- `queue_job_duration_ms`
- `queue_jobs_active`
