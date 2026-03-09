# Convenções

## Nomes

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Apps | kebab-case | `api-gateway`, `partner-portal` |
| Libs | `<categoria>-<nome>` | `shared-config`, `domain-partner` |
| Arquivos TS | kebab-case | `app.controller.ts` |
| Classes | PascalCase | `AppController`, `DrizzleModule` |
| Funções/variáveis | camelCase | `getConfig`, `connectionString` |

## Imports

```typescript
// Padrão: @ultima-forma/<categoria>-<nome>
import { getConfig } from '@ultima-forma/shared-config';
import { logger } from '@ultima-forma/shared-logger';
import { AppError } from '@ultima-forma/shared-errors';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
```

## Organização em domain/application/infrastructure

- **domain:** Entidades, value objects, regras puras (sem framework)
- **application:** Use cases, serviços de aplicação
- **infrastructure:** Implementações (DB, HTTP, etc.)

## Migrations

Formato Drizzle: `{timestamp}_{nome_descritivo}.sql`

Exemplo: `0000_nosy_microchip.sql`

## Commits (opcional)

Sugestão: Conventional Commits

```
feat(partner): add createIssuer use case
fix(gateway): health check DB connection
docs: update setup instructions
```
