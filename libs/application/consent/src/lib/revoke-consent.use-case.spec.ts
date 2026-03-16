import { RevokeConsentUseCase } from './revoke-consent.use-case';
import type {
  ConsentRepositoryPort,
  ConsentStatus,
} from '@ultima-forma/domain-consent';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';

function makeConsent(overrides: Partial<{ status: ConsentStatus }> = {}) {
  return {
    id: 'consent-1',
    dataRequestId: 'req-1',
    status: 'approved' as ConsentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('RevokeConsentUseCase', () => {
  let useCase: RevokeConsentUseCase;
  let repo: jest.Mocked<ConsentRepositoryPort>;
  let auditRepo: jest.Mocked<AuditRepositoryPort>;

  beforeEach(() => {
    repo = {
      findConsentById: jest.fn(),
      revokeConsent: jest.fn(),
      createDataRequest: jest.fn(),
      findDataRequestById: jest.fn(),
      findDataRequestForUser: jest.fn(),
      findConsentByRequestId: jest.fn(),
      approveConsent: jest.fn(),
      rejectConsent: jest.fn(),
      expireRequest: jest.fn(),
      findByIdempotencyKey: jest.fn(),
      findDataRequestResultForConsumer: jest.fn(),
      listDataRequests: jest.fn(),
      listConsentsByTenant: jest.fn(),
    };
    auditRepo = {
      append: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      findMany: jest.fn(),
      count: jest.fn(),
    };
    useCase = new RevokeConsentUseCase(repo, auditRepo);
  });

  it('should revoke an approved consent', async () => {
    repo.findConsentById.mockResolvedValue(makeConsent({ status: 'approved' }));
    repo.revokeConsent.mockResolvedValue({
      id: 'rev-1',
      consentId: 'consent-1',
      reason: 'User request',
      revokedBy: 'user-123',
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      consentId: 'consent-1',
      reason: 'User request',
      revokedBy: 'user-123',
    });

    expect(result.id).toBe('rev-1');
    expect(repo.revokeConsent).toHaveBeenCalledWith(
      'consent-1',
      'User request',
      'user-123'
    );
    expect(auditRepo.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'consent_revoked' })
    );
  });

  it('should throw if consent not found', async () => {
    repo.findConsentById.mockResolvedValue(null);

    await expect(
      useCase.execute({ consentId: 'nope', revokedBy: 'user' })
    ).rejects.toThrow('Consent not found');
  });

  it('should reject revocation of pending consent', async () => {
    repo.findConsentById.mockResolvedValue(makeConsent({ status: 'pending' }));

    await expect(
      useCase.execute({ consentId: 'consent-1', revokedBy: 'user' })
    ).rejects.toThrow('Cannot revoke a pending consent');
  });

  it('should reject revocation of rejected consent', async () => {
    repo.findConsentById.mockResolvedValue(makeConsent({ status: 'rejected' }));

    await expect(
      useCase.execute({ consentId: 'consent-1', revokedBy: 'user' })
    ).rejects.toThrow('Cannot revoke a rejected consent');
  });

  it('should reject revocation of already revoked consent', async () => {
    repo.findConsentById.mockResolvedValue(makeConsent({ status: 'revoked' }));

    await expect(
      useCase.execute({ consentId: 'consent-1', revokedBy: 'user' })
    ).rejects.toThrow('Consent has already been revoked');
  });
});
