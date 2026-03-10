import { AppError } from '@ultima-forma/shared-errors';
import type {
  ConsentRepositoryPort,
  CreateDataRequestInput,
  DataRequest,
} from '@ultima-forma/domain-consent';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';

export class CreateDataRequestUseCase {
  constructor(
    private readonly consentRepo: ConsentRepositoryPort,
    private readonly partnerRepo: PartnerRepositoryPort
  ) {}

  async execute(input: CreateDataRequestInput): Promise<DataRequest> {
    if (input.idempotencyKey) {
      const existing = await this.consentRepo.findByIdempotencyKey(
        input.idempotencyKey
      );
      if (existing) return existing;
    }

    const consumer = await this.partnerRepo.findConsumerById(input.consumerId);
    if (!consumer) {
      throw new AppError('CONSUMER_NOT_FOUND', 'Consumer not found', 404);
    }
    if (consumer.tenantId !== input.tenantId) {
      throw new AppError(
        'TENANT_MISMATCH',
        'Consumer does not belong to the specified tenant',
        400
      );
    }
    if (consumer.status !== 'active') {
      throw new AppError('CONSUMER_INACTIVE', 'Consumer is not active', 400);
    }

    if (!input.claims?.length) {
      throw new AppError('INVALID_INPUT', 'At least one claim is required', 400);
    }

    if (input.expiresAt <= new Date()) {
      throw new AppError(
        'INVALID_INPUT',
        'expiresAt must be in the future',
        400
      );
    }

    return this.consentRepo.createDataRequest(input);
  }
}
