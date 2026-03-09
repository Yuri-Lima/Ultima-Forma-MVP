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
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/ultima_forma | Conexão PostgreSQL |
| API_GATEWAY_PORT | 3333 | Porta do api-gateway |
| ORCHESTRATION_API_PORT | 3334 | Porta do orchestration-api |
| NODE_ENV | development | Ambiente |

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
