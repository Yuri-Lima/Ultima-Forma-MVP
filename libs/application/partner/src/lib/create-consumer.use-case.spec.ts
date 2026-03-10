import { CreateConsumerUseCase } from './create-consumer.use-case';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import { AppError } from '@ultima-forma/shared-errors';

describe('CreateConsumerUseCase', () => {
  const mockRepo: jest.Mocked<PartnerRepositoryPort> = {
    findPartnerById: jest.fn(),
    findConsumerById: jest.fn(),
    createIssuer: jest.fn(),
    createConsumer: jest.fn(),
    rotateIntegrationCredential: jest.fn(),
  };

  const useCase = new CreateConsumerUseCase(mockRepo);

  beforeEach(() => jest.clearAllMocks());

  it('should create consumer when partner exists', async () => {
    mockRepo.findPartnerById.mockResolvedValue({
      id: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Partner',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepo.createConsumer.mockResolvedValue({
      id: 'consumer-id',
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Test Consumer',
      status: 'active',
      scopes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Test Consumer',
    });

    expect(result.id).toBe('consumer-id');
  });

  it('should throw when partner not found', async () => {
    mockRepo.findPartnerById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        partnerId: 'unknown',
        tenantId: 'tenant-id',
        name: 'Test',
      })
    ).rejects.toThrow(AppError);
  });
});
