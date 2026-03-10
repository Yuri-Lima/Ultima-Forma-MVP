import { CreateDataRequestUseCase } from './create-data-request.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import { AppError } from '@ultima-forma/shared-errors';

describe('CreateDataRequestUseCase', () => {
  const expiresAt = new Date(Date.now() + 86400000);

  it('should create data request when consumer exists and is active', async () => {
    const consentRepo: ConsentRepositoryPort = {
      createDataRequest: jest.fn().mockResolvedValue({
        id: 'request-id',
        consumerId: 'consumer-id',
        tenantId: 'tenant-id',
        status: 'pending',
        purpose: 'Test purpose',
        expiresAt,
        idempotencyKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findDataRequestById: jest.fn(),
      findDataRequestForUser: jest.fn(),
      findConsentById: jest.fn(),
      findConsentByRequestId: jest.fn(),
      approveConsent: jest.fn(),
      rejectConsent: jest.fn(),
      expireRequest: jest.fn(),
      findByIdempotencyKey: jest.fn(),
    };
    const partnerRepo: PartnerRepositoryPort = {
      findPartnerById: jest.fn(),
      findConsumerById: jest.fn().mockResolvedValue({
        id: 'consumer-id',
        tenantId: 'tenant-id',
        name: 'Test Consumer',
        status: 'active',
      }),
      createIssuer: jest.fn(),
      createConsumer: jest.fn(),
      rotateIntegrationCredential: jest.fn(),
    };

    const useCase = new CreateDataRequestUseCase(consentRepo, partnerRepo);
    const result = await useCase.execute({
      consumerId: 'consumer-id',
      tenantId: 'tenant-id',
      purpose: 'Test purpose',
      claims: ['email', 'name'],
      expiresAt,
    });

    expect(result.id).toBe('request-id');
    expect(consentRepo.createDataRequest).toHaveBeenCalledWith({
      consumerId: 'consumer-id',
      tenantId: 'tenant-id',
      purpose: 'Test purpose',
      claims: ['email', 'name'],
      expiresAt,
      idempotencyKey: undefined,
    });
  });

  it('should throw when consumer not found', async () => {
    const consentRepo = { createDataRequest: jest.fn() } as unknown as ConsentRepositoryPort;
    const partnerRepo = {
      findConsumerById: jest.fn().mockResolvedValue(null),
    } as unknown as PartnerRepositoryPort;

    const useCase = new CreateDataRequestUseCase(consentRepo, partnerRepo);
    await expect(
      useCase.execute({
        consumerId: 'invalid',
        tenantId: 'tenant-id',
        purpose: 'Test',
        claims: ['email'],
        expiresAt,
      })
    ).rejects.toThrow(AppError);

    expect(consentRepo.createDataRequest).not.toHaveBeenCalled();
  });

  it('should return existing when idempotency key matches', async () => {
    const existing = {
      id: 'existing-id',
      consumerId: 'consumer-id',
      tenantId: 'tenant-id',
      status: 'pending' as const,
      purpose: 'Test',
      expiresAt,
      idempotencyKey: 'key-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const consentRepo = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(existing),
    } as unknown as ConsentRepositoryPort;
    const partnerRepo = { findConsumerById: jest.fn() } as unknown as PartnerRepositoryPort;

    const useCase = new CreateDataRequestUseCase(consentRepo, partnerRepo);
    const result = await useCase.execute({
      consumerId: 'consumer-id',
      tenantId: 'tenant-id',
      purpose: 'Test',
      claims: ['email'],
      expiresAt,
      idempotencyKey: 'key-123',
    });

    expect(result).toBe(existing);
    expect(consentRepo.findByIdempotencyKey).toHaveBeenCalledWith('key-123');
  });
});
