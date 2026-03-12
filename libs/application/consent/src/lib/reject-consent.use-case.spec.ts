import { RejectConsentUseCase } from './reject-consent.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';
import { AppError } from '@ultima-forma/shared-errors';

describe('RejectConsentUseCase', () => {
  it('should reject consent when pending and emit audit event', async () => {
    const receipt = {
      id: 'receipt-id',
      consentId: 'consent-id',
      approved: false,
      receiptData: { requestId: 'request-id' },
      createdAt: new Date(),
    };
    const repo: ConsentRepositoryPort = {
      findConsentById: jest.fn().mockResolvedValue({
        id: 'consent-id',
        dataRequestId: 'request-id',
        status: 'pending',
      }),
      rejectConsent: jest.fn().mockResolvedValue(receipt),
    } as unknown as ConsentRepositoryPort;
    const auditRepo: AuditRepositoryPort = {
      append: jest.fn().mockResolvedValue({}),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const useCase = new RejectConsentUseCase(repo, auditRepo);
    const result = await useCase.execute('consent-id');

    expect(result.approved).toBe(false);
    expect(repo.rejectConsent).toHaveBeenCalledWith('consent-id');
    expect(auditRepo.append).toHaveBeenCalledWith({
      eventType: 'consent_rejected',
      aggregateType: 'consent',
      aggregateId: 'consent-id',
      payload: { requestId: 'request-id', consentId: 'consent-id' },
    });
  });

  it('should throw when consent not found', async () => {
    const repo = {
      findConsentById: jest.fn().mockResolvedValue(null),
    } as unknown as ConsentRepositoryPort;
    const auditRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as AuditRepositoryPort;

    const useCase = new RejectConsentUseCase(repo, auditRepo);
    await expect(useCase.execute('invalid')).rejects.toThrow(AppError);
  });
});
