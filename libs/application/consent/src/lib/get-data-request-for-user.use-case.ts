import { AppError } from '@ultima-forma/shared-errors';
import type {
  ConsentRepositoryPort,
  DataRequestWithDetails,
} from '@ultima-forma/domain-consent';

export class GetDataRequestForUserUseCase {
  constructor(private readonly repo: ConsentRepositoryPort) {}

  async execute(requestId: string): Promise<DataRequestWithDetails> {
    const result = await this.repo.findDataRequestForUser(requestId);
    if (!result) {
      throw new AppError('REQUEST_NOT_FOUND', 'Data request not found', 404);
    }
    if (result.request.status !== 'pending') {
      throw new AppError(
        'REQUEST_NOT_PENDING',
        'Request has already been processed or expired',
        400
      );
    }
    if (result.request.expiresAt <= new Date()) {
      throw new AppError('REQUEST_EXPIRED', 'Request has expired', 400);
    }
    if (result.consent.status !== 'pending') {
      throw new AppError(
        'CONSENT_ALREADY_DECIDED',
        'Consent has already been decided',
        400
      );
    }
    return result;
  }
}
