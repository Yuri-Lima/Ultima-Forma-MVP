import { GetConsentHistoryUseCase } from './get-consent-history.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';

describe('GetConsentHistoryUseCase', () => {
  let useCase: GetConsentHistoryUseCase;
  let repo: jest.Mocked<ConsentRepositoryPort>;

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
    useCase = new GetConsentHistoryUseCase(repo);
  });

  it('should return empty list', async () => {
    repo.listConsentsByTenant.mockResolvedValue({ items: [], total: 0 });

    const result = await useCase.execute({ tenantId: 'tenant-1' });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should return consent history with pagination', async () => {
    const items = [
      {
        consent: {
          id: 'c1',
          dataRequestId: 'r1',
          status: 'approved' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        dataRequest: {
          id: 'r1',
          consumerId: 'cons-1',
          tenantId: 'tenant-1',
          status: 'completed' as const,
          purpose: 'KYC',
          expiresAt: new Date(),
          idempotencyKey: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        claims: ['email'],
        consumerName: 'Acme',
      },
    ];
    repo.listConsentsByTenant.mockResolvedValue({ items, total: 1 });

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      limit: 10,
      offset: 0,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(repo.listConsentsByTenant).toHaveBeenCalledWith(
      'tenant-1',
      { tenantId: 'tenant-1', status: undefined },
      { limit: 10, offset: 0 }
    );
  });

  it('should pass status filter to repository', async () => {
    repo.listConsentsByTenant.mockResolvedValue({ items: [], total: 0 });

    await useCase.execute({ tenantId: 't1', status: 'revoked' });

    expect(repo.listConsentsByTenant).toHaveBeenCalledWith(
      't1',
      { tenantId: 't1', status: 'revoked' },
      { limit: 50, offset: 0 }
    );
  });
});
