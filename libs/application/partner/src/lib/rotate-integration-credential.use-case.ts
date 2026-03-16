import { AppError } from '@ultima-forma/shared-errors';
import type { PartnerRepositoryPort, RotateCredentialResult } from '@ultima-forma/domain-partner';

export class RotateIntegrationCredentialUseCase {
  constructor(
    private readonly repo: PartnerRepositoryPort,
    private readonly encryptionKey?: string,
  ) {}

  async execute(partnerId: string): Promise<RotateCredentialResult> {
    const partner = await this.repo.findPartnerById(partnerId);
    if (!partner) {
      throw new AppError('PARTNER_NOT_FOUND', 'Partner not found', 404);
    }
    if (partner.status !== 'active') {
      throw new AppError('PARTNER_INACTIVE', 'Partner is not active', 400);
    }
    return this.repo.rotateIntegrationCredential(partnerId, this.encryptionKey);
  }
}
