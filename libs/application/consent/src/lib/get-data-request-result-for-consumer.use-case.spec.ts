import { GetDataRequestResultForConsumerUseCase } from './get-data-request-result-for-consumer.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import { AppError } from '@ultima-forma/shared-errors';

describe('GetDataRequestResultForConsumerUseCase', () => {
  const pendingResult = {
    requestId: 'request-id',
    status: 'pending',
    consumerId: 'consumer-id',
    consumerName: 'Demo Consumer',
    purpose: 'Test',
    claims: ['email', 'name'],
    expiresAt: new Date(),
    createdAt: new Date(),
  };

  const completedResult = {
    ...pendingResult,
    status: 'completed' as const,
    receipt: {
      id: 'receipt-id',
      approved: true,
      trustLevel: 'high' as const,
      verificationResult: {
        trustLevel: 'high' as const,
        verifiedAt: new Date(),
        verifiedClaims: ['email', 'name'],
      },
    },
  };

  const rejectedResult = {
    ...pendingResult,
    status: 'rejected' as const,
    receipt: {
      id: 'receipt-id',
      approved: false,
      trustLevel: 'low' as const,
      verificationResult: {
        trustLevel: 'low' as const,
        verifiedAt: new Date(),
        verifiedClaims: [],
      },
    },
  };

  const expiredResult = {
    ...pendingResult,
    status: 'expired' as const,
  };

  it('should return result for pending request', async () => {
    const repo: ConsentRepositoryPort = {
      findDataRequestResultForConsumer: jest.fn().mockResolvedValue(pendingResult),
    } as unknown as ConsentRepositoryPort;

    const useCase = new GetDataRequestResultForConsumerUseCase(repo);
    const result = await useCase.execute('request-id');

    expect(result).toEqual(pendingResult);
    expect(result.receipt).toBeUndefined();
  });

  it('should return result for completed request with receipt', async () => {
    const repo: ConsentRepositoryPort = {
      findDataRequestResultForConsumer: jest.fn().mockResolvedValue(completedResult),
    } as unknown as ConsentRepositoryPort;

    const useCase = new GetDataRequestResultForConsumerUseCase(repo);
    const result = await useCase.execute('request-id');

    expect(result.status).toBe('completed');
    expect(result.receipt).toBeDefined();
    expect(result.receipt?.trustLevel).toBe('high');
    expect(result.receipt?.verificationResult?.verifiedClaims).toEqual(['email', 'name']);
  });

  it('should return result for rejected request', async () => {
    const repo: ConsentRepositoryPort = {
      findDataRequestResultForConsumer: jest.fn().mockResolvedValue(rejectedResult),
    } as unknown as ConsentRepositoryPort;

    const useCase = new GetDataRequestResultForConsumerUseCase(repo);
    const result = await useCase.execute('request-id');

    expect(result.status).toBe('rejected');
    expect(result.receipt?.trustLevel).toBe('low');
  });

  it('should return result for expired request', async () => {
    const repo: ConsentRepositoryPort = {
      findDataRequestResultForConsumer: jest.fn().mockResolvedValue(expiredResult),
    } as unknown as ConsentRepositoryPort;

    const useCase = new GetDataRequestResultForConsumerUseCase(repo);
    const result = await useCase.execute('request-id');

    expect(result.status).toBe('expired');
    expect(result.receipt).toBeUndefined();
  });

  it('should throw when request not found', async () => {
    const repo: ConsentRepositoryPort = {
      findDataRequestResultForConsumer: jest.fn().mockResolvedValue(null),
    } as unknown as ConsentRepositoryPort;

    const useCase = new GetDataRequestResultForConsumerUseCase(repo);
    await expect(useCase.execute('invalid')).rejects.toThrow(AppError);
  });
});
