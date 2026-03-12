import { AppError } from '@ultima-forma/shared-errors';
import type {
  ConsentReceipt,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';

export class RejectConsentUseCase {
  constructor(
    private readonly repo: ConsentRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort
  ) {}

  async execute(consentId: string): Promise<ConsentReceipt> {
    const consent = await this.repo.findConsentById(consentId);
    if (!consent) {
      throw new AppError('CONSENT_NOT_FOUND', 'Consent not found', 404);
    }
    if (consent.status !== 'pending') {
      throw new AppError(
        'CONSENT_ALREADY_DECIDED',
        'Consent has already been approved or rejected',
        400
      );
    }
    const receipt = await this.repo.rejectConsent(consentId);

    const receiptData = receipt.receiptData as Record<string, unknown>;
    const requestId = receiptData['requestId'] as string;

    await this.auditRepo.append({
      eventType: 'consent_rejected',
      aggregateType: 'consent',
      aggregateId: consentId,
      payload: {
        requestId,
        consentId,
      },
    });

    return receipt;
  }
}
