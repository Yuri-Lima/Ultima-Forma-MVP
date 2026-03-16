export interface RecordApiUsageInput {
  partnerId: string;
  route: string;
  method: string;
  statusCode: number;
  correlationId?: string;
  responseTimeMs?: number;
}

export interface ActiveCredentialSecret {
  credentialId: string;
  secret: string;
}

export interface PartnerSecurityRepositoryPort {
  findActiveCredentialSecret(
    partnerId: string
  ): Promise<ActiveCredentialSecret | null>;
  isNonceUsed(nonceHash: string): Promise<boolean>;
  storeNonce(
    partnerId: string,
    nonceHash: string,
    expiresAt: Date
  ): Promise<void>;
  recordApiUsage(input: RecordApiUsageInput): Promise<void>;
  cleanExpiredNonces(): Promise<number>;
}
