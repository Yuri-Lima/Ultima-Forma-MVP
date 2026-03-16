export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  apiGatewayPort: number;
  orchestrationApiPort: number;
  credentialEncryptionKey: string;
  partnerAuthEnabled: boolean;
  partnerAuthTimestampToleranceMs: number;
}

export function getConfig(): AppConfig {
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  const databaseUrl =
    process.env['DATABASE_URL'] ??
    'postgresql://postgres:postgres@localhost:5432/ultima_forma';

  return {
    nodeEnv,
    port: parseInt(process.env['PORT'] ?? '3333', 10),
    databaseUrl,
    apiGatewayPort: parseInt(process.env['API_GATEWAY_PORT'] ?? '3333', 10),
    orchestrationApiPort: parseInt(
      process.env['ORCHESTRATION_API_PORT'] ?? '3334',
      10
    ),
    credentialEncryptionKey: process.env['CREDENTIAL_ENCRYPTION_KEY'] ?? '',
    partnerAuthEnabled: process.env['PARTNER_AUTH_ENABLED'] === 'true',
    partnerAuthTimestampToleranceMs: parseInt(
      process.env['PARTNER_AUTH_TIMESTAMP_TOLERANCE_MS'] ?? '300000',
      10
    ),
  };
}
