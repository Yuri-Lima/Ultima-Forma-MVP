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
   - Padrão (docker-compose): `postgresql://postgres:postgres@localhost:55432/ultima_forma`
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

**Erro:** `Unable to resolve module`, `expo-router/entry` não encontrado, `@expo/router-server/node/render.js` não encontrado, ou `500 (Internal Server Error)` com MIME type `application/json`

**Soluções:**

1. **pnpm + server rendering:** O projeto usa `.npmrc` com `node-linker=hoisted` e `shamefully-hoist=true` para que o Metro resolva corretamente os módulos em monorepos. Se remover essas opções, reinstale: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
2. O `main` em `apps/user-app/package.json` deve apontar para `index.js`, que importa `expo-router/entry` (fix para [expo/expo#29139](https://github.com/expo/expo/issues/29139))
3. Limpar cache: `pnpm nx run user-app:serve -- --clear`
4. Reinstalar: `pnpm install`

## Expo – Unable to resolve @ultima-forma/shared-i18n

**Erro:** `Unable to resolve module @ultima-forma/shared-i18n`

**Causa:** O Metro (bundler do Expo) não usa os `paths` do `tsconfig.base.json`; ele precisa encontrar o pacote em `node_modules`.

**Soluções:**

1. **Dependência no root:** O `@ultima-forma/shared-i18n` está declarado no `package.json` raiz como `file:libs/shared/i18n`. Execute `pnpm install` na raiz do projeto.
2. **watchFolders:** O `metro.config.js` do user-app configura `watchFolders: [monorepoRoot]` para o Metro observar o monorepo.
3. **Entry point:** O `libs/shared/i18n/package.json` usa `"main": "./src/index.ts"` para o Metro resolver o módulo.
4. **Limpar cache:** `cd apps/user-app && npx expo start --clear`

## Drizzle – connection refused

Ver seção "Database não conecta" acima. O Drizzle usa `DATABASE_URL` para conectar.

## Docker – container não sobe

**Erro:** `port is already allocated` ou `Cannot connect to the Docker daemon`

**Soluções:**

1. Verificar se a porta 55432 está livre: `lsof -i :55432`
2. Iniciar o Docker Desktop (macOS/Windows)
3. Se já existir Postgres local, usar outro host/porta no `docker-compose.yml` ou no `DATABASE_URL`

## Build falha em lib compartilhada

**Erro:** `Cannot find module '@ultima-forma/...'`

**Solução:** Verificar `tsconfig.base.json` e se o path está correto em `paths`.

## URL de consentimento não funciona

**Problema:** O `consentUrl` retornado pela API (ex: `http://localhost:8081/consent/xxx`) não abre ou redireciona para home.

**Soluções:**

1. **user-app deve estar rodando em modo web** – A consentUrl é uma URL web. Rode:
   ```bash
   pnpm dev:user-app
   ```
   Isso inicia o user-app na porta 8081 (dev server com server-side rendering). O modo nativo (`dev:user-app:native`) expõe o app no Expo Go, mas a consentUrl continua sendo uma URL web – ao abri-la no celular, precisa acessar a máquina de desenvolvimento.

2. **Testando no celular** – `localhost` no celular aponta para o próprio aparelho. É necessário configurar **duas** variáveis com o IP da sua máquina na LAN (ex: `192.168.1.5`):
   - `USER_APP_URL=http://<IP>:8081` – usada pelo api-gateway para gerar o consentUrl
   - `EXPO_PUBLIC_API_URL=http://<IP>:3333` – usada pela página de consentimento (no celular) para chamar o api-gateway
   
   Adicione ao `.env`, reinicie o api-gateway e suba o user-app com `EXPO_PUBLIC_API_URL` disponível (o Expo injeta variáveis que começam com `EXPO_PUBLIC_` no bundle).

3. **Produção** – O user-app usa `web.output: "server"` e server-side rendering. Rotas dinâmicas como `/consent/<requestId>` funcionam diretamente. Para testar o build de produção localmente: `pnpm dev:user-app:prod` (requer api-gateway rodando em outra terminal). Em produção, é necessário um servidor Node (EAS Hosting, Express, Vercel Edge, etc.) para renderizar páginas a cada request.

## Expo – QR code não funciona no Expo Go

**Problema:** O QR code não abre o app no Expo Go ou dá erro ao escanear.

**Causa:** O script `dev:user-app` roda `expo start --web`, que prioriza o navegador. O QR code para Expo Go (app nativo) exige rodar sem `--web`.

**Soluções:**

1. **Usar o script nativo** – Para testar no celular com Expo Go:
   ```bash
   pnpm dev:user-app:native
   ```
   Depois escaneie o QR code com a câmera (iOS) ou pelo Expo Go (Android).

2. **Rede diferente (celular em 4G, PC em Wi‑Fi)** – Use o modo tunnel:
   ```bash
   pnpm dev:user-app:tunnel
   ```
   O tunnel gera um URL público que funciona fora da LAN (mais lento).

3. **Mesma rede** – PC e celular precisam estar na mesma rede Wi‑Fi. Se não conectar:
   - Desative temporariamente o firewall para testar
   - Confirme que a rede não está em modo “Guest” ou com isolamento de clientes

4. **Alternativa** – Se só precisa de web, continue com `pnpm dev:user-app` e acesse `http://localhost:8081` no navegador.

## Expo – aviso de versão de pacotes

**Aviso:** `The following packages should be updated for best compatibility with the installed expo version`

O projeto usa Expo SDK 55. Se aparecer avisos de versão, execute `npx expo install --fix` no diretório `apps/user-app` para corrigir dependências.
