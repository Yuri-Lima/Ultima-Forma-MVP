# Setup

## Pre-requisitos

| Ferramenta | Versao minima |
|------------|---------------|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker | Qualquer versao recente |
| Xcode (iOS) | Ultima estavel |
| Android Studio (Android) | Ultima estavel |

## Instalacao passo a passo

### 1. Clone e dependencias

```bash
cd Ultima-Forma-MVP
pnpm install
```

### 2. Variaveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` se necessario. Variaveis:

| Variavel | Padrao | Descricao |
|----------|--------|-----------|
| `DATABASE_URL` | postgresql://postgres:YOUR_PASSWORD@localhost:55432/ultima_forma | Conexao PostgreSQL |
| `API_GATEWAY_PORT` | 3333 | Porta do api-gateway |
| `ORCHESTRATION_API_PORT` | 3334 | Porta do orchestration-api |
| `NODE_ENV` | development | Ambiente (`development`, `staging`, `production`) |
| `USER_APP_URL` | http://localhost:8081 | URL usada pelo api-gateway para gerar consentUrl |
| `EXPO_PUBLIC_API_URL` | http://localhost:3333 | URL da API injetada no user-app (Expo) |
| `INTERNAL_API_KEY` | *(opcional em dev)* | Quando definida, /internal/* exige header X-API-Key. **Obrigatoria em production** |
| `RATE_LIMIT_TTL` | 60000 | Janela em ms para rate limit (api-gateway) |
| `RATE_LIMIT_LIMIT` | 100 | Requisicoes max por janela (api-gateway) |
| `CREDENTIAL_ENCRYPTION_KEY` | *(opcional em dev)* | Chave AES-256-GCM (32 bytes hex). **Obrigatoria em production**. Gerar com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PARTNER_SIGNATURE_TTL` | 300000 | Tolerancia de timestamp para assinatura HMAC em ms (5 min) |
| `FF_PARTNER_AUTH` | false | Feature flag: autenticacao HMAC para parceiros |
| `FF_CLAIMS_VALIDATION` | false | Feature flag: validacao de claims no registry |
| `FF_WALLET_PRESENTATIONS` | false | Feature flag: endpoints de presentation sessions |

Em **production**, `CREDENTIAL_ENCRYPTION_KEY` e `INTERNAL_API_KEY` sao obrigatorias e `DATABASE_URL` nao pode apontar para localhost. A validacao Zod no startup impede o boot se as variaveis estiverem invalidas.

### 3. Banco de dados

```bash
pnpm db:up           # Sobe PostgreSQL
pnpm db:migrate:safe # Aplica migrations com logging estruturado
pnpm db:seed         # Cria tenant e partner de demonstracao (IDs fixos)
```

Scripts adicionais de seed:

| Comando | Descricao |
|---------|-----------|
| `pnpm db:seed` | Seed padrao (dev) |
| `pnpm db:seed:dev` | Fixtures de desenvolvimento com IDs fixos |
| `pnpm db:seed:prod` | Bootstrap de producao (idempotente, sem IDs fixos) |
| `pnpm db:migrate:safe` | Migrations com logging JSON estruturado |

Apos o seed, use os IDs para testar os endpoints; veja `docs/development-guide.md`.

### 4. Build info (opcional)

Para gerar metadados de build (usados pelo endpoint `/version`):

```bash
pnpm build:info
```

Isso cria `build-info.json` na raiz com versao, git commit e timestamp. O comando `dev:all` ja executa isso automaticamente.

### 5. Verificacao

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
- [ ] `pnpm db:migrate:safe` aplica migrations com logs estruturados
- [ ] `pnpm dev:gateway` sobe na porta 3333
- [ ] `curl http://localhost:3333/health` retorna `{"status":"ok",...}`
- [ ] `curl http://localhost:3333/version` retorna versao e git commit
- [ ] `curl http://localhost:3333/ready` retorna `{"ready":true,...}`
- [ ] `pnpm db:seed` cria tenant e partner

## Configuracao opcional

- **IDE:** Nx Console para VSCode ou JetBrains
- **Debug:** `.vscode/launch.json` ja inclui configuracoes para Nest
- **Prettier/ESLint:** Configurados no workspace
