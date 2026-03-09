# Guia de Desenvolvimento

## Comandos Nx principais

```bash
# Build de um projeto
pnpm nx run <projeto>:build

# Servir em desenvolvimento
pnpm nx run <projeto>:serve
# ou
pnpm nx serve <projeto>

# Testes
pnpm nx run <projeto>:test

# Lint
pnpm nx run <projeto>:lint
```

## Rodar cada app

| App | Comando | Saída |
|-----|---------|-------|
| api-gateway | `pnpm dev:gateway` | http://localhost:3333 |
| orchestration-api | `pnpm dev:orchestration` | http://localhost:3334 |
| user-app (web) | `pnpm dev:user-app` | http://localhost:8081 |
| partner-portal | `pnpm dev:partner-portal` | http://localhost:4200 |

## Workflow típico

1. Criar branch a partir de `main`
2. Fazer alterações
3. Rodar `pnpm nx run <projeto>:build` (e testes se houver)
4. Commit com mensagem descritiva

## Gerar migrations Drizzle

```bash
# 1. Editar schema em libs/infrastructure/drizzle/src/lib/schema.ts
# 2. Gerar migration
pnpm db:generate

# 3. Aplicar
pnpm db:migrate
```

## Adicionar nova lib

```bash
pnpm nx g @nx/js:library <nome> --directory=libs/<categoria>/<nome> --importPath=@ultima-forma/<categoria>-<nome> --no-interactive
```

Exemplo para domain:

```bash
pnpm nx g @nx/js:library partner --directory=libs/domain/partner --importPath=@ultima-forma/domain-partner --no-interactive
```

## Estrutura de pastas por tipo

### NestJS (api-gateway, orchestration-api)

```
apps/<app>/src/
├── main.ts
├── app/
│   ├── app.module.ts
│   ├── app.controller.ts
│   └── *.exception-filter.ts
```

### Expo (user-app)

```
apps/user-app/
├── src/
│   └── app/           # Expo Router (file-based)
│       ├── _layout.tsx
│       └── index.tsx
├── app.json
├── metro.config.js
```

### Vite/React (partner-portal)

```
apps/partner-portal/
├── src/
│   ├── main.tsx
│   └── app/
│       └── app.tsx
├── index.html
└── vite.config.mts
```
