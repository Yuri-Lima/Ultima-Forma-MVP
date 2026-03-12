import { ExpireRequestUseCase } from './expire-request.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';
import { AppError } from '@ultima-forma/shared-errors';

describe('ExpireRequestUseCase', () => {
  it('should expire request when pending and emit audit event', async () => {
    const expired = {
      id: 'request-id',
      consumerId: 'consumer-id',
      tenantId: 'tenant-id',
      status: 'expired' as const,
      purpose: 'Test',
      expiresAt: new Date(),
      idempotencyKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo: ConsentRepositoryPort = {
      findDataRequestById: jest.fn().mockResolvedValue({
        ...expired,
        status: 'pending',
      }),
      expireRequest: jest.fn().mockResolvedValue(expired),
    } as unknown as ConsentRepositoryPort;
    const auditRepo: AuditRepositoryPort = {
      append: jest.fn().mockResolvedValue({}),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const useCase = new ExpireRequestUseCase(repo, auditRepo);
    const result = await useCase.execute('request-id');

    expect(result.status).toBe('expired');
    expect(repo.expireRequest).toHaveBeenCalledWith('request-id');
    expect(auditRepo.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'request_expired',
        aggregateType: 'data_request',
        aggregateId: 'request-id',
      })
    );
  });

  it('should throw when request not found', async () => {
    const repo = {
      findDataRequestById: jest.fn().mockResolvedValue(null),
    } as unknown as ConsentRepositoryPort;
    const auditRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as AuditRepositoryPort;

    const useCase = new ExpireRequestUseCase(repo, auditRepo);
    await expect(useCase.execute('invalid')).rejects.toThrow(AppError);
  });

  it('should throw when request not pending', async () => {
    const repo = {
      findDataRequestById: jest.fn().mockResolvedValue({
        id: 'request-id',
        status: 'completed',
      }),
    } as unknown as ConsentRepositoryPort;
    const auditRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as AuditRepositoryPort;

    const useCase = new ExpireRequestUseCase(repo, auditRepo);
    await expect(useCase.execute('request-id')).rejects.toThrow(AppError);
  });
});
