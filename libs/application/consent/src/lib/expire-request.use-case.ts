import { AppError } from '@ultima-forma/shared-errors';
import type {
  DataRequest,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';

export class ExpireRequestUseCase {
  constructor(
    private readonly repo: ConsentRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort
  ) {}

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
    const expired = await this.repo.expireRequest(requestId);

    await this.auditRepo.append({
      eventType: 'request_expired',
      aggregateType: 'data_request',
      aggregateId: requestId,
      payload: {
        requestId,
        consumerId: expired.consumerId,
        tenantId: expired.tenantId,
        status: 'expired',
      },
    });

    return expired;
  }
}
