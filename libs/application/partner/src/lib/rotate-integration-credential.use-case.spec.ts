import { RotateIntegrationCredentialUseCase } from './rotate-integration-credential.use-case';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import { AppError } from '@ultima-forma/shared-errors';

describe('RotateIntegrationCredentialUseCase', () => {
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

  const useCase = new RotateIntegrationCredentialUseCase(mockRepo);

  beforeEach(() => jest.clearAllMocks());

  it('should return secret when partner exists', async () => {
    mockRepo.findPartnerById.mockResolvedValue({
      id: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Partner',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepo.rotateIntegrationCredential.mockResolvedValue({
      credentialId: 'cred-id',
      secret: 'new-secret-123',
      secretHash: 'hash',
    });

    const result = await useCase.execute('partner-id');

    expect(result.secret).toBe('new-secret-123');
    expect(mockRepo.rotateIntegrationCredential).toHaveBeenCalledWith(
      'partner-id',
      undefined
    );
  });

  it('should throw when partner not found', async () => {
    mockRepo.findPartnerById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toThrow(AppError);
  });

  it('should throw when partner inactive', async () => {
    mockRepo.findPartnerById.mockResolvedValue({
      id: 'partner-id',
      tenantId: 'tenant-id',
      name: 'Partner',
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute('partner-id')).rejects.toThrow(AppError);
  });
});
