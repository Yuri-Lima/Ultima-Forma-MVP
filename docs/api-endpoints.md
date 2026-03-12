# API Endpoints

Base URLs:

- **api-gateway**: `http://localhost:3333` (or `API_GATEWAY_PORT`)
- **orchestration-api**: `http://localhost:3334` (or `ORCHESTRATION_API_PORT`)

All responses include `X-Correlation-ID` when supported (api-gateway, orchestration-api). Pass `X-Correlation-ID` or `X-Request-ID` in requests to propagate trace IDs.

---

## api-gateway

Rate limit: 100 req/min per IP (configurable via `RATE_LIMIT_TTL`, `RATE_LIMIT_LIMIT`). `/health` is exempt.

### Health

| Method | Path     | Auth | Description                  |
|--------|----------|------|------------------------------|
| GET    | /health  | No   | Health check, DB status      |

**Response:** `{ status, timestamp, db? }`

---

### Issuers

| Method | Path             | Auth | Description     |
|--------|------------------|------|-----------------|
| POST   | /v1/issuers      | No   | Create issuer   |
| PATCH  | /v1/issuers/:id  | No   | Update issuer   |

**POST /v1/issuers**

Body: `{ tenantId, partnerId, name, scopes? }`

Response: `{ id, partnerId, tenantId, name, status, scopes, createdAt, updatedAt }`

**PATCH /v1/issuers/:id**

Body: at least one of `{ name?, status?, scopes? }`. `status`: `active` | `inactive` | `revoked`.

Response: `{ id, partnerId, tenantId, name, status, scopes, createdAt, updatedAt }`

---

### Consumers

| Method | Path               | Auth | Description    |
|--------|--------------------|------|----------------|
| POST   | /v1/consumers      | No   | Create consumer |
| PATCH  | /v1/consumers/:id  | No   | Update consumer |

**POST /v1/consumers**

Body: `{ tenantId, partnerId, name, scopes? }`

Response: `{ id, partnerId, tenantId, name, status, scopes, createdAt, updatedAt }`

**PATCH /v1/consumers/:id**

Body: at least one of `{ name?, status?, scopes? }`. `status`: `active` | `inactive` | `revoked`.

Response: `{ id, partnerId, tenantId, name, status, scopes, createdAt, updatedAt }`

---

### Integration Credentials

| Method | Path                                | Auth | Description      |
|--------|-------------------------------------|------|------------------|
| POST   | /v1/integration-credentials/rotate  | No   | Rotate credential |

**POST /v1/integration-credentials/rotate**

Body: `{ partnerId }`

Response: `{ credentialId, secret, message }` (secret shown once)

---

### Data Requests

| Method | Path                        | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| POST   | /v1/data-requests           | No   | Create data request            |
| GET    | /v1/data-requests/:id       | No   | Get request for user (consent) |
| GET    | /v1/data-requests/:id/result| No   | Get result for consumer        |
| POST   | /v1/data-requests/:id/expire| No  | Expire request                 |

**POST /v1/data-requests**

Body: `{ consumerId, tenantId, purpose, claims, expiresAt, idempotencyKey? }`

Headers: `Idempotency-Key` (optional, overrides body)

Idempotency: When `Idempotency-Key` or `idempotencyKey` is provided, duplicate requests return the existing request instead of creating a new one.

Response: `{ id, consumerId, tenantId, status, purpose, expiresAt, consentUrl, createdAt, updatedAt }`

**GET /v1/data-requests/:id**

Response: `{ request, consumerName, items, consentId }`

**GET /v1/data-requests/:id/result**

Response: `{ requestId, status, consumerId, consumerName, purpose, claims, expiresAt, createdAt, receipt? }`

**POST /v1/data-requests/:id/expire**

Response: `{ id, status, updatedAt }`

---

### Consents

| Method | Path                   | Auth | Description     |
|--------|------------------------|------|-----------------|
| POST   | /v1/consents/:id/approve | No | Approve consent |
| POST   | /v1/consents/:id/reject  | No | Reject consent  |

**POST /v1/consents/:id/approve**

Response: `{ receiptId, approved, createdAt }`

**POST /v1/consents/:id/reject**

Response: `{ receiptId, approved, createdAt }`

---

## orchestration-api

Internal API. When `INTERNAL_API_KEY` is set, requests must include `X-API-Key` header.

### Health

| Method | Path    | Auth | Description     |
|--------|---------|------|-----------------|
| GET    | /health | No   | Health check    |

**Response:** `{ status, timestamp, db? }`

---

### Internal Routes (X-API-Key when INTERNAL_API_KEY is set)

| Method | Path                         | Auth | Description          |
|--------|------------------------------|------|----------------------|
| GET    | /internal/requests           | Yes  | List data requests   |
| GET    | /internal/audit-events        | Yes  | List audit events    |
| GET    | /internal/webhook-deliveries  | Yes  | List webhook deliveries |
| POST   | /internal/consents/:id/approve| Yes  | Approve consent      |
| POST   | /internal/consents/:id/reject | Yes  | Reject consent      |

**GET /internal/requests**

Query: `status?`, `tenantId?`, `limit?` (1–100), `offset?`

Response: `{ items, total }`

**GET /internal/audit-events**

Query: `eventType?`, `aggregateId?`, `limit?` (1–100), `offset?`

Response: `{ items, total }`

**GET /internal/webhook-deliveries**

Query: `status?`, `subscriptionId?`, `limit?` (1–100), `offset?`

Response: `{ items, total }`

**POST /internal/consents/:id/approve**

Response: `{ receiptId, approved, createdAt }`

**POST /internal/consents/:id/reject**

Response: `{ receiptId, approved, createdAt }`
