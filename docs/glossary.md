# Glossario

## Termos de dominio

| Termo | Definicao |
|-------|-----------|
| **Partner** | Entidade que integra com a plataforma (emissor ou consumidor) |
| **Issuer** | Emissor de credenciais. Entidade que emite atestados sobre o usuario |
| **Consumer** | Consumidor. Entidade que solicita dados ao usuario |
| **Data Request** | Solicitacao de dados feita por um consumidor ao usuario |
| **Consent** | Consentimento do usuario para compartilhar dados |
| **Consent Policy** | Politica configuravel por tenant que limita duracao e claims permitidos |
| **Consent Revocation** | Ato de revogar um consentimento previamente aprovado |
| **Claim Definition** | Definicao centralizada de um tipo de dado (email, phone, etc.) com nivel de sensibilidade |
| **Claim Permission** | Autorizacao de um parceiro para emitir ou consumir um claim especifico |
| **Verification** | Verificacao de credenciais ou apresentacoes |
| **Trust Level** | Nivel de confianca calculado para uma verificacao |
| **Integration Credential** | Credencial de integracao de um parceiro. Contem secret (hash + cifrado) para autenticacao HMAC |
| **Nonce** | Valor de uso unico para prevenir ataques de replay em assinaturas |
| **User Subject** | Representacao de identidade portavel de um usuario no sistema |
| **Credential Reference** | Vinculo entre um user subject e uma credencial emitida por um issuer |
| **Presentation Session** | Sessao de apresentacao de credenciais vinculada a um data request |
| **Feature Flag** | Chave que habilita ou desabilita uma funcionalidade da plataforma via env var |

## Termos tecnicos

| Termo | Definicao |
|-------|-----------|
| **api-gateway** | API NestJS de entrada publica, expoe endpoints para parceiros |
| **orchestration-api** | API interna de orquestracao de fluxos |
| **user-app** | App universal do usuario (Expo + Expo Router) |
| **partner-portal** | Portal web para parceiros (emissores e consumidores) |
| **ops-console** | Console web para operacao interna |
| **Drizzle** | ORM usado para persistencia (Drizzle ORM + drizzle-kit) |
| **Expo Router** | Roteamento file-based para o app Expo |
| **PartnerSignatureGuard** | Guard NestJS que valida assinatura HMAC SHA-256 nas rotas /v1/* |
| **FeatureFlagService** | Servico que le flags de env vars com prefixo `FF_` |
| **HealthModule** | Modulo NestJS compartilhado que expoe /health, /ready, /version, /metrics |
| **AppExceptionFilter** | Filtro global de excecoes que padroniza respostas de erro |
| **ErrorCode** | Enum com codigos de erro padronizados da plataforma |
| **MetricsInterceptor** | Interceptor NestJS que registra metricas HTTP via prom-client |
| **AES-256-GCM** | Algoritmo de criptografia simetrica usado para cifrar secrets de integracao |
| **prom-client** | Biblioteca Node.js para expor metricas no formato Prometheus |
| **Zod** | Biblioteca de validacao de schemas usada para validar config de ambiente |
| **ResolveSubjectUseCase** | Use case que busca ou cria um user subject por tenant + external ref |

## Siglas

| Sigla | Significado |
|-------|-------------|
| PII | Personally Identifiable Information |
| VC | Verifiable Credential |
| DID | Decentralized Identifier |
| RBAC | Role-Based Access Control |
| HMAC | Hash-based Message Authentication Code |
| GCM | Galois/Counter Mode (modo de operacao de cifras de bloco) |
| ZKP | Zero-Knowledge Proof |
| FF | Feature Flag |
