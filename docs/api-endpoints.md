# API Endpoints

Base URLs:

- **api-gateway**: `http://localhost:3333` (or `API_GATEWAY_PORT`)
- **orchestration-api**: `http://localhost:3334` (or `ORCHESTRATION_API_PORT`)

All responses include `X-Correlation-ID`. Pass `X-Correlation-ID` or `X-Request-ID` in requests to propagate trace IDs.

## Standard Error Format

All error responses follow a uniform envelope:

```json
{
  "errorCode": "CONSENT_NOT_FOUND",
  "message": "The requested consent was not found.",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00.000Z"
}
```

Error codes are defined in the `ErrorCode` enum (`libs/shared/errors`).

---

## api-gateway

Rate limit: 100 req/min per IP (configurable via `RATE_LIMIT_TTL`, `RATE_LIMIT_LIMIT`). Infrastructure endpoints are exempt.

### Partner HMAC Authentication

When `FF_PARTNER_AUTH=true`, partner-facing `/v1/*` endpoints require HMAC signature authentication. User-facing endpoints (consent approve/reject/revoke, consent detail/history, data-request GET by ID) are exempt.

**Required Headers:**

| Header | Description |
|--------|-------------|
| `X-Partner-Id` | UUID of the partner |
| `X-Timestamp` | ISO 8601 timestamp of the request |
| `X-Signature` | HMAC SHA-256 hex signature |

**Signature computation:**

```
signature = HMAC_SHA256(secret, METHOD + PATH + BODY + TIMESTAMP)
```

### Infrastructure Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check (DB, uptime, version) |
| GET | /ready | No | Readiness check (DB + config valid) |
| GET | /version | No | Build metadata (version, gitCommit, buildTime, environment) |
| GET | /metrics | No | Prometheus metrics |

---

### Issuers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/issuers | HMAC | Create issuer |
| PATCH | /v1/issuers/:id | HMAC | Update issuer |

---

### Consumers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/consumers | HMAC | Create consumer |
| PATCH | /v1/consumers/:id | HMAC | Update consumer |

---

### Integration Credentials

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/integration-credentials/rotate | HMAC | Rotate credential |

---

### Data Requests

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/data-requests | HMAC | Create data request |
| GET | /v1/data-requests/:id | No | Get request for user (consent) |
| GET | /v1/data-requests/:id/result | HMAC | Get result for consumer |
| POST | /v1/data-requests/:id/expire | HMAC | Expire request |

---

### Consents

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/consents/:id/approve | No | Approve consent |
| POST | /v1/consents/:id/reject | No | Reject consent |
| POST | /v1/consents/:id/revoke | No | Revoke consent |
| GET | /v1/consents/:id | No | Consent detail |
| GET | /v1/consents/tenant/:tenantId | No | Consent history by tenant |

**POST /v1/consents/:id/revoke** -- Body: `{ revokedBy, reason? }`

**GET /v1/consents/tenant/:tenantId** -- Query: `status?`, `limit?`, `offset?`

---

### Claims Registry

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/claims | HMAC | Register claim |
| GET | /v1/claims | HMAC | List claims |
| POST | /v1/claims/:id/permissions | HMAC | Assign permission |

**POST /v1/claims** -- Body: `{ key, namespace, displayName, description?, sensitivityLevel, jsonSchema? }`

**POST /v1/claims/:id/permissions** -- Body: `{ partnerId, permissionType }` (`issue` | `consume` | `both`)

---

### Partner Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /v1/partner/dashboard | HMAC | Dashboard metrics |
| GET | /v1/partner/requests | HMAC | Partner requests |
| GET | /v1/partner/credentials | HMAC | Partner credentials |
| POST | /v1/partner/credentials/rotate | HMAC | Rotate credential |
| GET | /v1/partner/webhooks | HMAC | List webhooks |
| POST | /v1/partner/webhooks | HMAC | Create webhook |
| PATCH | /v1/partner/webhooks/:id | HMAC | Update webhook |

---

### Subjects & Presentations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/subjects | HMAC | Register user subject |
| GET | /v1/subjects/:id | HMAC | Get subject detail |
| POST | /v1/subjects/:id/credentials | HMAC | Register credential ref |
| POST | /v1/presentations | HMAC | Create presentation session |
| POST | /v1/presentations/:id/complete | HMAC | Complete presentation |

---

## orchestration-api

Internal API. When `INTERNAL_API_KEY` is set, requests must include `X-API-Key` header.

### Infrastructure Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check (DB, uptime, version) |
| GET | /ready | No | Readiness check (DB + config valid) |
| GET | /version | No | Build metadata |
| GET | /metrics | No | Prometheus metrics |

### Internal Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /internal/requests | Yes | List data requests |
| GET | /internal/audit-events | Yes | List audit events |
| GET | /internal/webhook-deliveries | Yes | List webhook deliveries |
| GET | /internal/consents | Yes | List consents |
| POST | /internal/consents/:id/approve | Yes | Approve consent |
| POST | /internal/consents/:id/reject | Yes | Reject consent |
