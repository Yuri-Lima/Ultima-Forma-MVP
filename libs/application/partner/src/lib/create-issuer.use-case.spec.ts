import { CreateIssuerUseCase } from './create-issuer.use-case';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import { AppError } from '@ultima-forma/shared-errors';

describe('CreateIssuerUseCase', () => {
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

  const useCase = new CreateIssuerUseCase(mockRepo);

  beforeEach(() => jest.clearAllMocks());

  it('should create issuer when partner exists and belongs to tenant', async () => {
    mockRepo.findPartnerById.mockResolvedValue({
      id: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Partner',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepo.createIssuer.mockResolvedValue({
      id: 'issuer-id',
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Test Issuer',
      status: 'active',
      scopes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Test Issuer',
    });

    expect(result.id).toBe('issuer-id');
    expect(mockRepo.createIssuer).toHaveBeenCalledWith({
      partnerId: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Test Issuer',
      scopes: undefined,
    });
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

  it('should throw when tenant mismatch', async () => {
    mockRepo.findPartnerById.mockResolvedValue({
      id: 'partner-id',
      tenantId: 'other-tenant',
      name: 'Partner',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        partnerId: 'partner-id',
        tenantId: 'tenant-id',
        name: 'Test',
      })
    ).rejects.toThrow(AppError);
  });
});
