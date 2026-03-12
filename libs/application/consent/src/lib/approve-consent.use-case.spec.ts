import { ApproveConsentUseCase } from './approve-consent.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type {
  AuditRepositoryPort,
  BillableEventRepositoryPort,
} from '@ultima-forma/domain-audit';
import { AppError } from '@ultima-forma/shared-errors';

describe('ApproveConsentUseCase', () => {
  it('should approve consent when pending and emit audit + billable events', async () => {
    const receipt = {
      id: 'receipt-id',
      consentId: 'consent-id',
      approved: true,
      receiptData: {
        requestId: 'request-id',
        trustLevel: 'high',
        verificationResult: { verifiedClaims: ['email', 'name'] },
      },
      createdAt: new Date(),
    };
    const repo: ConsentRepositoryPort = {
      findConsentById: jest.fn().mockResolvedValue({
        id: 'consent-id',
        dataRequestId: 'request-id',
        status: 'pending',
      }),
      approveConsent: jest.fn().mockResolvedValue(receipt),
      findDataRequestById: jest.fn().mockResolvedValue({
        id: 'request-id',
        tenantId: 'tenant-id',
      }),
    } as unknown as ConsentRepositoryPort;
    const auditRepo: AuditRepositoryPort = {
      append: jest.fn().mockResolvedValue({}),
      findMany: jest.fn(),
      count: jest.fn(),
    };
    const billableRepo: BillableEventRepositoryPort = {
      append: jest.fn().mockResolvedValue({}),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const useCase = new ApproveConsentUseCase(repo, auditRepo, billableRepo);
    const result = await useCase.execute('consent-id');

    expect(result).toEqual(receipt);
    expect(repo.approveConsent).toHaveBeenCalledWith('consent-id');
    expect(auditRepo.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'consent_granted',
        aggregateType: 'consent',
        aggregateId: 'consent-id',
      })
    );
    expect(billableRepo.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'consent_granted',
        dataRequestId: 'request-id',
        tenantId: 'tenant-id',
      })
    );
  });

  it('should throw when consent not found', async () => {
    const approveConsent = jest.fn();
    const repo = {
      findConsentById: jest.fn().mockResolvedValue(null),
      approveConsent,
    } as unknown as ConsentRepositoryPort;
    const auditRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as AuditRepositoryPort;
    const billableRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as BillableEventRepositoryPort;

    const useCase = new ApproveConsentUseCase(repo, auditRepo, billableRepo);
    await expect(useCase.execute('invalid')).rejects.toThrow(AppError);
    expect(approveConsent).not.toHaveBeenCalled();
  });

  it('should throw when consent already decided', async () => {
    const repo = {
      findConsentById: jest.fn().mockResolvedValue({
        id: 'consent-id',
        status: 'approved',
      }),
    } as unknown as ConsentRepositoryPort;
    const auditRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as AuditRepositoryPort;
    const billableRepo = {
      append: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    } as unknown as BillableEventRepositoryPort;

    const useCase = new ApproveConsentUseCase(repo, auditRepo, billableRepo);
    await expect(useCase.execute('consent-id')).rejects.toThrow(AppError);
  });
});
