#!/usr/bin/env bash
# Exemplos de chamada aos endpoints do api-gateway usando IDs do seed.
# Pré-requisitos: pnpm db:seed já executado, api-gateway rodando (pnpm dev:gateway)

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3333}"
TENANT_ID="21a30170-166d-44e3-ac09-b640768dc1c7"
PARTNER_ID="c2989a86-ca61-40f2-9d8a-e6250bde4f9d"

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
echo ""
