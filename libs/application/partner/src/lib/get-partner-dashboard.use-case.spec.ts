import { GetPartnerDashboardUseCase } from './get-partner-dashboard.use-case';
import type {
  PartnerDashboardRepositoryPort,
  PartnerRepositoryPort,
} from '@ultima-forma/domain-partner';

describe('GetPartnerDashboardUseCase', () => {
  let useCase: GetPartnerDashboardUseCase;
  let dashboardRepo: jest.Mocked<PartnerDashboardRepositoryPort>;
  let partnerRepo: jest.Mocked<PartnerRepositoryPort>;

  beforeEach(() => {
    dashboardRepo = {
      getDashboardMetrics: jest.fn(),
      listPartnerRequests: jest.fn(),
      listPartnerCredentials: jest.fn(),
      listPartnerWebhooks: jest.fn(),
      createWebhook: jest.fn(),
      updateWebhook: jest.fn(),
    };
    partnerRepo = {
      findPartnerById: jest.fn(),
      findIssuerById: jest.fn(),
      findConsumerById: jest.fn(),
      createIssuer: jest.fn(),
      createConsumer: jest.fn(),
      updateIssuer: jest.fn(),
      updateConsumer: jest.fn(),
      rotateIntegrationCredential: jest.fn(),
    };
    useCase = new GetPartnerDashboardUseCase(dashboardRepo, partnerRepo);
  });

  it('should return dashboard metrics', async () => {
    partnerRepo.findPartnerById.mockResolvedValue({
      id: 'p1',
      tenantId: 't1',
      name: 'Acme',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    dashboardRepo.getDashboardMetrics.mockResolvedValue({
      totalRequests: 10,
      pendingRequests: 2,
      completedRequests: 8,
      totalApiCalls: 50,
      failedApiCalls: 3,
      activeCredentials: 1,
      activeWebhooks: 2,
    });

    const result = await useCase.execute('p1');
    expect(result.totalRequests).toBe(10);
  });

  it('should throw if partner not found', async () => {
    partnerRepo.findPartnerById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toThrow(
      'Partner not found'
    );
  });
});
