import { AppError } from '@ultima-forma/shared-errors';
import type {
  ConsentRepositoryPort,
  ConsentRevocation,
} from '@ultima-forma/domain-consent';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';

export interface RevokeConsentInput {
  consentId: string;
  reason?: string;
  revokedBy: string;
}

export class RevokeConsentUseCase {
  constructor(
    private readonly repo: ConsentRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort
  ) {}

  async execute(input: RevokeConsentInput): Promise<ConsentRevocation> {
    const consent = await this.repo.findConsentById(input.consentId);
    if (!consent) {
      throw new AppError('CONSENT_NOT_FOUND', 'Consent not found', 404);
    }
    if (consent.status === 'pending') {
      throw new AppError(
        'CONSENT_CANNOT_REVOKE_PENDING',
        'Cannot revoke a pending consent — approve or reject it first',
        400
      );
    }
    if (consent.status === 'rejected') {
      throw new AppError(
        'CONSENT_CANNOT_REVOKE_REJECTED',
        'Cannot revoke a rejected consent',
        400
      );
    }
    if (consent.status === 'revoked') {
      throw new AppError(
        'CONSENT_ALREADY_REVOKED',
        'Consent has already been revoked',
        409
      );
    }

    const revocation = await this.repo.revokeConsent(
      input.consentId,
      input.reason ?? null,
      input.revokedBy
    );

    await this.auditRepo.append({
      eventType: 'consent_revoked',
      aggregateType: 'consent',
      aggregateId: input.consentId,
      payload: {
        consentId: input.consentId,
        requestId: consent.dataRequestId,
        reason: input.reason ?? null,
        revokedBy: input.revokedBy,
      },
    });

    return revocation;
  }
}
