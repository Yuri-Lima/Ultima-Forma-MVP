#!/usr/bin/env bash
# Exemplos de chamada aos endpoints do api-gateway usando IDs do seed.
# IDs devem corresponder a scripts/fixtures.ts
# Pré-requisitos: pnpm db:seed já executado, api-gateway rodando (pnpm dev:gateway)

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3333}"
TENANT_ID="21a30170-166d-44e3-ac09-b640768dc1c7"
PARTNER_ID="c2989a86-ca61-40f2-9d8a-e6250bde4f9d"
CONSUMER_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
ISSUER_ID="b2c3d4e5-f6a7-8901-bcde-f12345678901"

echo "=== Testando endpoints com Tenant ID: $TENANT_ID e Partner ID: $PARTNER_ID ==="
echo ""

echo "1. POST /v1/issuers"
curl -s -X POST "$BASE_URL/v1/issuers" \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"partnerId\":\"$PARTNER_ID\",\"name\":\"Test Issuer\"}"
echo -e "\n"

echo "2. POST /v1/consumers"
curl -s -X POST "$BASE_URL/v1/consumers" \
  -H "Content-Type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"partnerId\":\"$PARTNER_ID\",\"name\":\"Test Consumer\"}"
echo -e "\n"

echo "3. POST /v1/integration-credentials/rotate"
curl -s -X POST "$BASE_URL/v1/integration-credentials/rotate" \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\"}"
echo -e "\n"

EXPIRES_AT=$(date -u -v+1d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "+1 day" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "2026-12-31T23:59:59Z")

echo "4. PATCH /v1/issuers/$ISSUER_ID"
curl -s -X PATCH "$BASE_URL/v1/issuers/$ISSUER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Issuer (updated)"}'
echo -e "\n"

echo "5. POST /v1/data-requests (creates request + consent)"
RESP=$(curl -s -X POST "$BASE_URL/v1/data-requests" \
  -H "Content-Type: application/json" \
  -d "{\"consumerId\":\"$CONSUMER_ID\",\"tenantId\":\"$TENANT_ID\",\"purpose\":\"Test\",\"claims\":[\"email\",\"name\"],\"expiresAt\":\"$EXPIRES_AT\"}")
echo "$RESP"
REQUEST_ID=$(echo "$RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$REQUEST_ID" ]; then
  echo "  -> Use consentUrl from response or open: http://localhost:8081/consent/$REQUEST_ID"
  echo ""
  echo "6. GET /v1/data-requests/$REQUEST_ID/result (consumer polling)"
  curl -s "$BASE_URL/v1/data-requests/$REQUEST_ID/result" | head -20
  echo -e "\n  -> After user approves in user-app, call again to see receipt with trustLevel"
fi
echo ""
