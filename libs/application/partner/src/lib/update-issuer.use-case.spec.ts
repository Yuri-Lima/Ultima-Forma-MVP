import { UpdateIssuerUseCase } from './update-issuer.use-case';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';
import type { WebhookDispatcherPort } from '@ultima-forma/domain-webhook';
import { AppError } from '@ultima-forma/shared-errors';

describe('UpdateIssuerUseCase', () => {
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

  const useCase = new UpdateIssuerUseCase(mockRepo, mockAudit, mockDispatcher);

  beforeEach(() => jest.clearAllMocks());

  it('should update issuer and emit audit + webhook', async () => {
    mockRepo.findIssuerById.mockResolvedValue({
      id: 'issuer-id',
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Old Name',
      status: 'active',
      scopes: ['a'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepo.updateIssuer.mockResolvedValue({
      id: 'issuer-id',
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'New Name',
      status: 'active',
      scopes: ['a', 'b'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute('issuer-id', {
      name: 'New Name',
      scopes: ['a', 'b'],
    });

    expect(result.name).toBe('New Name');
    expect(mockRepo.updateIssuer).toHaveBeenCalledWith('issuer-id', {
      name: 'New Name',
      scopes: ['a', 'b'],
    });
    expect(mockAudit.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'issuer_updated',
        aggregateType: 'issuer',
        aggregateId: 'issuer-id',
      })
    );
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(
      'partner-id',
      expect.objectContaining({
        eventType: 'issuer.updated',
        aggregateType: 'issuer',
        aggregateId: 'issuer-id',
      })
    );
  });

  it('should throw when issuer not found', async () => {
    mockRepo.findIssuerById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown', { name: 'New' })
    ).rejects.toThrow(AppError);
  });
});
