import { AppError } from '@ultima-forma/shared-errors';
import type { CreateConsumerInput, PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import type { Consumer } from '@ultima-forma/domain-partner';

export class CreateConsumerUseCase {
  constructor(private readonly repo: PartnerRepositoryPort) {}

  async execute(input: CreateConsumerInput): Promise<Consumer> {
    const partner = await this.repo.findPartnerById(input.partnerId);
    if (!partner) {
      throw new AppError('PARTNER_NOT_FOUND', 'Partner not found', 404);
    }
    if (partner.tenantId !== input.tenantId) {
      throw new AppError(
        'TENANT_MISMATCH',
        'Partner does not belong to the specified tenant',
        400
      );
    }
    if (partner.status !== 'active') {
      throw new AppError('PARTNER_INACTIVE', 'Partner is not active', 400);
    }
    return this.repo.createConsumer(input);
  }
}
