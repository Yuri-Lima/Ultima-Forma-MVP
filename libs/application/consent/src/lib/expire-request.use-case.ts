import { AppError } from '@ultima-forma/shared-errors';
import type {
  DataRequest,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';

export class ExpireRequestUseCase {
  constructor(private readonly repo: ConsentRepositoryPort) {}

  async execute(requestId: string): Promise<DataRequest> {
    const request = await this.repo.findDataRequestById(requestId);
    if (!request) {
      throw new AppError('REQUEST_NOT_FOUND', 'Data request not found', 404);
    }
    if (request.status !== 'pending') {
      throw new AppError(
        'REQUEST_NOT_PENDING',
        'Request has already been processed or expired',
        400
      );
    }
    return this.repo.expireRequest(requestId);
  }
}
