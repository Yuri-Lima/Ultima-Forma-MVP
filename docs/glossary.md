# Glossário

## Termos de domínio

| Termo | Definição |
|-------|-----------|
| **Partner** | Entidade que integra com a plataforma (emissor ou consumidor) |
| **Issuer** | Emissor de credenciais. Entidade que emite atestados sobre o usuário |
| **Consumer** | Consumidor. Entidade que solicita dados ao usuário |
| **Data Request** | Solicitação de dados feita por um consumidor ao usuário |
| **Consent** | Consentimento do usuário para compartilhar dados |
| **Consent Policy** | Política configurável por tenant que limita duração e claims permitidos |
| **Consent Revocation** | Ato de revogar um consentimento previamente aprovado |
| **Claim Definition** | Definição centralizada de um tipo de dado (email, phone, etc.) com nível de sensibilidade |
| **Claim Permission** | Autorização de um parceiro para emitir ou consumir um claim específico |
| **Verification** | Verificação de credenciais ou apresentações |
| **Trust Level** | Nível de confiança calculado para uma verificação |
| **Integration Credential** | Credencial de integração de um parceiro. Contém secret (hash + cifrado) para autenticação HMAC |
| **Nonce** | Valor de uso único para prevenir ataques de replay em assinaturas |
| **User Subject** | Representação de identidade portátil de um usuário no sistema |
| **Credential Reference** | Vínculo entre um user subject e uma credencial emitida por um issuer |
| **Presentation Session** | Sessão de apresentação de credenciais vinculada a um data request |

## Termos técnicos

| Termo | Definição |
|-------|-----------|
| **api-gateway** | API NestJS de entrada pública, expõe endpoints para parceiros |
| **orchestration-api** | API interna de orquestração de fluxos |
| **user-app** | App universal do usuário (Expo + Expo Router) |
| **partner-portal** | Portal web para parceiros (emissores e consumidores) |
| **ops-console** | Console web para operação interna |
| **Drizzle** | ORM usado para persistência (Drizzle ORM + drizzle-kit) |
| **Expo Router** | Roteamento file-based para o app Expo |
| **PartnerSignatureGuard** | Guard NestJS que valida assinatura HMAC SHA-256 nas rotas /v1/* |
| **MetricsInterceptor** | Interceptor NestJS que registra métricas HTTP via prom-client |
| **AES-256-GCM** | Algoritmo de criptografia simétrica usado para cifrar secrets de integração |
| **prom-client** | Biblioteca Node.js para expor métricas no formato Prometheus |

## Siglas

| Sigla | Significado |
|-------|-------------|
| PII | Personally Identifiable Information |
| VC | Verifiable Credential |
| DID | Decentralized Identifier |
| RBAC | Role-Based Access Control |
| HMAC | Hash-based Message Authentication Code |
| GCM | Galois/Counter Mode (modo de operação de cifras de bloco) |
| ZKP | Zero-Knowledge Proof |
