import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type {
  PartnerRepositoryPort,
  PartnerSecurityRepositoryPort,
} from '@ultima-forma/domain-partner';

export interface ValidatePartnerSignatureInput {
  partnerId: string;
  timestamp: string;
  signature: string;
  method: string;
  path: string;
  body: string;
  toleranceMs: number;
}

export interface ValidatePartnerSignatureResult {
  valid: boolean;
  reason?: string;
}

export class ValidatePartnerSignatureUseCase {
  constructor(
    private readonly securityRepo: PartnerSecurityRepositoryPort,
    private readonly partnerRepo: PartnerRepositoryPort
  ) {}

  async execute(
    input: ValidatePartnerSignatureInput
  ): Promise<ValidatePartnerSignatureResult> {
    if (!input.partnerId || !input.timestamp || !input.signature) {
      return { valid: false, reason: 'MISSING_AUTH_HEADERS' };
    }

    const requestTime = new Date(input.timestamp).getTime();
    if (isNaN(requestTime)) {
      return { valid: false, reason: 'INVALID_TIMESTAMP' };
    }

    const now = Date.now();
    if (Math.abs(now - requestTime) > input.toleranceMs) {
      return { valid: false, reason: 'TIMESTAMP_EXPIRED' };
    }

    const partner = await this.partnerRepo.findPartnerById(input.partnerId);
    if (!partner) {
      return { valid: false, reason: 'PARTNER_NOT_FOUND' };
    }
    if (partner.status !== 'active') {
      return { valid: false, reason: 'PARTNER_INACTIVE' };
    }

    const credential =
      await this.securityRepo.findActiveCredentialSecret(input.partnerId);
    if (!credential) {
      return { valid: false, reason: 'NO_ACTIVE_CREDENTIAL' };
    }

    const payload =
      input.method.toUpperCase() + input.path + input.body + input.timestamp;
    const expectedSignature = createHmac('sha256', credential.secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(input.signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return { valid: false, reason: 'INVALID_SIGNATURE' };
    }

    const nonceHash = createHash('sha256')
      .update(input.signature + input.timestamp)
      .digest('hex');

    const nonceUsed = await this.securityRepo.isNonceUsed(nonceHash);
    if (nonceUsed) {
      return { valid: false, reason: 'REPLAY_DETECTED' };
    }

    const nonceExpiry = new Date(now + input.toleranceMs * 2);
    await this.securityRepo.storeNonce(input.partnerId, nonceHash, nonceExpiry);

    return { valid: true };
  }
}
