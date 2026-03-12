import { AppError } from '@ultima-forma/shared-errors';
import type {
  Consent,
  ConsentReceipt,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';
import type {
  AuditRepositoryPort,
  BillableEventRepositoryPort,
} from '@ultima-forma/domain-audit';

export class ApproveConsentUseCase {
  constructor(
    private readonly repo: ConsentRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort,
    private readonly billableRepo: BillableEventRepositoryPort
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
    const receipt = await this.repo.approveConsent(consentId);

    const receiptData = receipt.receiptData as Record<string, unknown>;
    const requestId = receiptData['requestId'] as string;
    const trustLevel = receiptData['trustLevel'] ?? 'high';
    const verificationResult = receiptData['verificationResult'] as
      | Record<string, unknown>
      | undefined;
    const verifiedClaims =
      (verificationResult?.['verifiedClaims'] as string[]) ?? [];

    const dataRequest = await this.repo.findDataRequestById(requestId);
    const tenantId = dataRequest?.tenantId ?? '';

    await this.auditRepo.append({
      eventType: 'consent_granted',
      aggregateType: 'consent',
      aggregateId: consentId,
      payload: {
        requestId,
        consentId,
        tenantId,
        trustLevel,
        verifiedClaims,
      },
    });

    await this.billableRepo.append({
      eventType: 'consent_granted',
      dataRequestId: requestId,
      tenantId,
      payload: {
        consentId,
        claims: verifiedClaims,
        trustLevel,
      },
    });

    return receipt;
  }
}
