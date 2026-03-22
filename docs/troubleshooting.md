# Troubleshooting

## Startup falha com "Invalid environment configuration"

**Causa:** A validacao Zod de config detectou variaveis ausentes ou invalidas.

**Solucao:** A mensagem de erro lista exatamente quais variaveis estao invalidas. Verifique o `.env` e corrija os valores. Em producao, `CREDENTIAL_ENCRYPTION_KEY` e `INTERNAL_API_KEY` sao obrigatorias.

```bash
# Exemplo de erro:
# Invalid environment configuration:
#   DATABASE_URL: DATABASE_URL is required
```

## "CREDENTIAL_ENCRYPTION_KEY is required in production"

**Causa:** `NODE_ENV=production` mas `CREDENTIAL_ENCRYPTION_KEY` esta vazio.

**Solucao:** Gerar e definir a chave:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Adicionar ao .env: CREDENTIAL_ENCRYPTION_KEY=<valor gerado>
```

## Porta em uso

**Erro:** `EADDRINUSE: address already in use :::3333` ou "Port 8081 is running this app in another window"

**Solucao:** Alterar a porta via variavel de ambiente ou encerrar o processo na porta.

```bash
# Alterar porta
API_GATEWAY_PORT=3335 pnpm dev:gateway
USER_APP_PORT=8082 pnpm dev:user-app

# Encerrar processo na porta (ex: 3333)
lsof -ti :3333 | xargs kill -9
# user-app web: lsof -ti :8081 | xargs kill -9
```

## Database nao conecta

**Erro:** `connection refused` ou `password authentication failed`

**Solucoes:**

1. Verificar se o container esta rodando: `docker ps | grep ultima-forma`
2. Subir o banco: `pnpm db:up`
3. Conferir `DATABASE_URL` no `.env`:
   - Padrao (docker-compose): `postgresql://postgres:postgres@localhost:55432/ultima_forma`
4. Aguardar alguns segundos apos `db:up` antes de rodar migrations

## Migration falha

**Erro:** `DrizzleQueryError` ou `relation does not exist`

**Solucoes:**

1. Usar o script seguro: `pnpm db:migrate:safe` (logging estruturado, exit code em caso de falha)
2. Gerar migrations apos alterar schema: `pnpm db:generate`
3. Se o banco estiver inconsistente, recriar:
   ```bash
   pnpm db:down
   pnpm db:up
   pnpm db:migrate:safe
   ```

## Endpoint retorna erro com formato inesperado

**Esperado:** Todos os erros HTTP devem retornar o envelope padrao:

```json
{
  "errorCode": "...",
  "message": "...",
  "correlationId": "...",
  "timestamp": "..."
}
```

Se voce vir um formato diferente, verifique se o `AppExceptionFilter` esta registrado no modulo:

```typescript
providers: [
  { provide: APP_FILTER, useClass: AppExceptionFilter },
]
```

## /version retorna "unknown" para gitCommit

**Causa:** O `build-info.json` nao foi gerado.

**Solucao:** Execute `pnpm build:info` ou use `pnpm dev:all` (que executa automaticamente).

## Partner Portal: 401 Unauthorized (REPLAY_DETECTED)

**Problema:** Muitas requisições retornam 401 com mensagem `Authentication failed: REPLAY_DETECTED`.

**Causa:** O api-gateway usa nonce (hash de assinatura + timestamp) para evitar replay. Quando várias requisições são feitas no mesmo milissegundo com o mesmo path/method/body, produzem a mesma assinatura e timestamp, e a segunda é rejeitada.

**Solução:** O Partner Portal já usa timestamps com precisão sub-milissegundo (`getUniqueTimestamp` em `api.ts`). Se o erro persistir: (1) reinicie o partner-portal para garantir que a versão mais recente está rodando; (2) verifique se não há cache antigo (hard refresh ou aba anônima).

## Feature flag nao funciona

**Problema:** `FF_PARTNER_AUTH=true` no `.env` mas a autenticacao HMAC nao e enforced.

**Solucoes:**

1. Reiniciar o api-gateway (config e cacheado)
2. Verificar se a variavel esta no `.env` correto (e nao em `.env.example`)
3. Verificar no log de startup se a flag aparece como `true`

## Expo / Nx -- Metro, workspace root

**Erro:** `Unable to resolve module`, `expo-router/entry` nao encontrado

**Solucoes:**

1. O projeto usa `.npmrc` com `node-linker=hoisted` e `shamefully-hoist=true`. Se remover essas opcoes, reinstale: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
2. O `main` em `apps/user-app/package.json` deve apontar para `index.js`
3. Limpar cache: `pnpm nx run user-app:serve -- --clear`
4. Reinstalar: `pnpm install`

## Expo -- Unable to resolve @ultima-forma/shared-i18n

**Causa:** O Metro nao usa os `paths` do `tsconfig.base.json`.

**Solucoes:**

1. `@ultima-forma/shared-i18n` esta declarado no `package.json` raiz como `file:libs/shared/i18n`. Execute `pnpm install`
2. O `metro.config.js` configura `watchFolders: [monorepoRoot]`
3. Limpar cache: `cd apps/user-app && npx expo start --clear`

## Redis nao conecta (Worker / BullMQ)

**Erro:** `ECONNREFUSED` ao conectar em Redis ou worker nao processa jobs.

**Solucoes:**

1. Verificar se o container Redis esta rodando: `docker ps | grep redis`
2. Subir a infraestrutura: `pnpm db:up` (inclui Redis)
3. Testar Redis: `redis-cli -h localhost -p 6388 ping` deve retornar `PONG`
  4. Verificar `.env`: `REDIS_HOST=localhost`, `REDIS_PORT=6388`

## Jobs nao sao processados (Webhook async)

**Problema:** Webhooks nao sao entregues ou demoram muito.

**Solucoes:**

1. Verificar se o worker esta rodando: `curl http://localhost:3335/health`
2. Verificar logs do worker por erros de conexao Redis
3. Inspecionar filas no Redis: `redis-cli` e `KEYS ultima-forma:*`
4. Verificar metricas: `curl http://localhost:3335/metrics` inclui `queue_jobs_*`

## Docker -- container nao sobe

**Erro:** `port is already allocated` ou `Cannot connect to the Docker daemon`

**Solucoes:**

1. Verificar porta 55432: `lsof -i :55432`
2. Iniciar o Docker Desktop (macOS/Windows)
3. Se houver Postgres local, usar outra porta

## Build falha em lib compartilhada

**Erro:** `Cannot find module '@ultima-forma/...'`

**Solucao:** Verificar `tsconfig.base.json` e se o path alias esta correto. Aliases atuais incluem: `domain-claims`, `domain-wallet`, `application-claims`, `application-wallet`, `shared-health`, `infrastructure-feature-flags`.

## URL de consentimento nao funciona

**Problema:** O `consentUrl` retornado pela API nao abre.

**Solucoes:**

1. user-app deve estar rodando: `pnpm dev:user-app`
2. Testando no celular: configurar `USER_APP_URL` e `EXPO_PUBLIC_API_URL` com o IP da maquina na LAN
3. Producao: o user-app usa server-side rendering; necessita servidor Node

## Expo -- QR code nao funciona no Expo Go

**Causa:** `dev:user-app` roda `expo start --web` (navegador). Para Expo Go:

```bash
pnpm dev:user-app:native    # Mesma rede
pnpm dev:user-app:tunnel    # Redes diferentes
```
