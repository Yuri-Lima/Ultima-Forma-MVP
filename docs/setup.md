# Setup

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker | Qualquer versão recente |
| Xcode (iOS) | Última estável |
| Android Studio (Android) | Última estável |

## Instalação passo a passo

### 1. Clone e dependências

```bash
cd Ultima-Forma-MVP
pnpm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` se necessário. Valores padrão:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| DATABASE_URL | postgresql://postgres:YOUR_PASSWORD@localhost:55432/ultima_forma | Conexão PostgreSQL |
| API_GATEWAY_PORT | 3333 | Porta do api-gateway |
| ORCHESTRATION_API_PORT | 3334 | Porta do orchestration-api |
| NODE_ENV | development | Ambiente |
| USER_APP_URL | http://localhost:8081 | URL usada pelo api-gateway para gerar consentUrl |
| EXPO_PUBLIC_API_URL | http://localhost:3333 | URL da API injetada no user-app (Expo) |
| INTERNAL_API_KEY | *(opcional)* | Quando definida, /internal/* exige header X-API-Key; ops-console usa VITE_INTERNAL_API_KEY |
| RATE_LIMIT_TTL | 60000 | *(opcional)* Janela em ms para rate limit (api-gateway) |
| RATE_LIMIT_LIMIT | 100 | *(opcional)* Requisições máx. por janela (api-gateway) |
| CREDENTIAL_ENCRYPTION_KEY | *(opcional)* | Chave AES-256-GCM (32 bytes hex) para cifrar secrets de integração. Gerar com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| PARTNER_AUTH_ENABLED | false | *(opcional)* Quando `true`, endpoints `/v1/*` exigem assinatura HMAC via headers `X-Partner-Id`, `X-Timestamp`, `X-Signature` |
| PARTNER_AUTH_TIMESTAMP_TOLERANCE_MS | 300000 | *(opcional)* Tolerância de timestamp para assinatura HMAC (padrão: 5 min) |

### 3. Banco de dados

```bash
pnpm db:up      # Sobe PostgreSQL
pnpm db:migrate # Aplica migrations
pnpm db:seed    # Cria tenant e partner de demonstração (IDs fixos)
```

Após o seed, use os IDs para testar os endpoints; veja `docs/development-guide.md` (seção "Testar endpoints").

### 4. Verificação

```bash
pnpm nx run api-gateway:build
pnpm nx run orchestration-api:build
pnpm nx run partner-portal:build
pnpm nx run user-app:export
```

## Checklist de funcionamento

- [ ] `pnpm install` sem erros
- [ ] `pnpm nx graph` abre o grafo
- [ ] `pnpm db:up` sobe o container
- [ ] `pnpm db:migrate` aplica migrations
- [ ] `pnpm dev:gateway` sobe na porta 3333
- [ ] `curl http://localhost:3333/health` retorna `{"status":"ok",...}`
- [ ] `pnpm db:seed` cria tenant e partner (IDs: `21a30170-166d-44e3-ac09-b640768dc1c7`, `c2989a86-ca61-40f2-9d8a-e6250bde4f9d`)

## Configuração opcional

- **IDE:** Nx Console para VSCode ou JetBrains
- **Debug:** `.vscode/launch.json` já inclui configurações para Nest
- **Prettier/ESLint:** Configurados no workspace
