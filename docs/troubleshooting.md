# Troubleshooting

## Porta em uso

**Erro:** `EADDRINUSE: address already in use :::3333`

**Solução:** Alterar a porta via variável de ambiente ou encerrar o processo que a usa.

```bash
API_GATEWAY_PORT=3335 pnpm dev:gateway
```

## Database não conecta

**Erro:** `connection refused` ou `password authentication failed`

**Soluções:**

1. Verificar se o container está rodando: `docker ps | grep ultima-forma`
2. Subir o banco: `pnpm db:up`
3. Conferir `DATABASE_URL` no `.env`:
   - Padrão: `postgresql://postgres:postgres@localhost:5432/ultima_forma`
   - Se usar outra instância Postgres, ajuste host/porta/usuário/senha
4. Aguardar alguns segundos após `db:up` antes de rodar migrations

## Migration falha

**Erro:** `DrizzleQueryError` ou `relation does not exist`

**Soluções:**

1. Gerar migrations após alterar schema: `pnpm db:generate`
2. Aplicar na ordem: `pnpm db:migrate`
3. Se o banco estiver inconsistente, recriar:
   ```bash
   pnpm db:down
   pnpm db:up
   pnpm db:migrate
   ```

## Expo / Nx – Metro, workspace root

**Erro:** `Unable to resolve module`, `expo-router/entry` não encontrado ou `500 (Internal Server Error)` com MIME type `application/json`

**Soluções:**

1. Em versões antigas do Expo: `EXPO_USE_METRO_WORKSPACE_ROOT=1` no `.env` (em SDK 55+ já é padrão)
2. O `main` em `apps/user-app/package.json` deve apontar para `index.js`, que importa `expo-router/entry` (fix para [expo/expo#29139](https://github.com/expo/expo/issues/29139))
3. Limpar cache: `pnpm nx run user-app:serve -- --clear`
4. Reinstalar: `pnpm install`

## Drizzle – connection refused

Ver seção "Database não conecta" acima. O Drizzle usa `DATABASE_URL` para conectar.

## Docker – container não sobe

**Erro:** `port is already allocated` ou `Cannot connect to the Docker daemon`

**Soluções:**

1. Verificar se a porta 5432 está livre: `lsof -i :5432`
2. Iniciar o Docker Desktop (macOS/Windows)
3. Se já existir Postgres local, usar outro host/porta no `docker-compose.yml` ou no `DATABASE_URL`

## Build falha em lib compartilhada

**Erro:** `Cannot find module '@ultima-forma/...'`

**Solução:** Verificar `tsconfig.base.json` e se o path está correto em `paths`.
