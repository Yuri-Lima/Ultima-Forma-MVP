import { AppError } from '@ultima-forma/shared-errors';
import type {
  Consent,
  ConsentReceipt,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';

export class ApproveConsentUseCase {
  constructor(private readonly repo: ConsentRepositoryPort) {}

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
    return this.repo.approveConsent(consentId);
  }
}
