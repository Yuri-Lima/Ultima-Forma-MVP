import { UpdateConsumerUseCase } from './update-consumer.use-case';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';
import type { WebhookDispatcherPort } from '@ultima-forma/domain-webhook';
import { AppError } from '@ultima-forma/shared-errors';

describe('UpdateConsumerUseCase', () => {
  const mockRepo: jest.Mocked<PartnerRepositoryPort> = {
    findPartnerById: jest.fn(),
    findIssuerById: jest.fn(),
    findConsumerById: jest.fn(),
    createIssuer: jest.fn(),
    createConsumer: jest.fn(),
    updateIssuer: jest.fn(),
    updateConsumer: jest.fn(),
    rotateIntegrationCredential: jest.fn(),
  };

  const mockAudit: jest.Mocked<AuditRepositoryPort> = {
    append: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };

  const mockDispatcher: jest.Mocked<WebhookDispatcherPort> = {
    dispatch: jest.fn(),
  };

  const useCase = new UpdateConsumerUseCase(
    mockRepo,
    mockAudit,
    mockDispatcher
  );

  beforeEach(() => jest.clearAllMocks());

  it('should update consumer and emit audit + webhook', async () => {
    mockRepo.findConsumerById.mockResolvedValue({
      id: 'consumer-id',
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Old Name',
      status: 'active',
      scopes: ['a'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepo.updateConsumer.mockResolvedValue({
      id: 'consumer-id',
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'New Name',
      status: 'inactive',
      scopes: ['a'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute('consumer-id', {
      name: 'New Name',
      status: 'inactive',
    });

    expect(result.name).toBe('New Name');
    expect(result.status).toBe('inactive');
    expect(mockRepo.updateConsumer).toHaveBeenCalledWith('consumer-id', {
      name: 'New Name',
      status: 'inactive',
    });
    expect(mockAudit.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'consumer_updated',
        aggregateType: 'consumer',
        aggregateId: 'consumer-id',
      })
    );
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(
      'partner-id',
      expect.objectContaining({
        eventType: 'consumer.updated',
        aggregateType: 'consumer',
        aggregateId: 'consumer-id',
      })
    );
  });

  it('should throw when consumer not found', async () => {
    mockRepo.findConsumerById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown', { name: 'New' })
    ).rejects.toThrow(AppError);
  });
});
