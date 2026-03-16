import { AppError } from '@ultima-forma/shared-errors';
import type {
  Consent,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';

export class GetConsentDetailUseCase {
  constructor(private readonly repo: ConsentRepositoryPort) {}

  async execute(consentId: string): Promise<Consent> {
    const consent = await this.repo.findConsentById(consentId);
    if (!consent) {
      throw new AppError('CONSENT_NOT_FOUND', 'Consent not found', 404);
    }
    return consent;
  }
}
