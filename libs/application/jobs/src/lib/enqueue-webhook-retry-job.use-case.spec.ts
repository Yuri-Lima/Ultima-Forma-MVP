import { EnqueueWebhookRetryJobUseCase } from './enqueue-webhook-retry-job.use-case';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

describe('EnqueueWebhookRetryJobUseCase', () => {
  const mockJobRepo: jest.Mocked<JobRepositoryPort> = {
    enqueue: jest.fn(),
  };

  const useCase = new EnqueueWebhookRetryJobUseCase(mockJobRepo);

  beforeEach(() => jest.clearAllMocks());

  it('should enqueue webhook.retry job with deliveryId', async () => {
    mockJobRepo.enqueue.mockResolvedValue({ jobId: 'retry-job-1' });

    const result = await useCase.execute({ deliveryId: 'delivery-failed' });

    expect(mockJobRepo.enqueue).toHaveBeenCalledWith(
      'webhook.retry',
      { deliveryId: 'delivery-failed' },
      { maxAttempts: 5 }
    );
    expect(result.jobId).toBe('retry-job-1');
  });

  it('should pass delayMs when provided', async () => {
    mockJobRepo.enqueue.mockResolvedValue({ jobId: 'retry-job-2' });

    await useCase.execute({
      deliveryId: 'delivery-failed',
      delayMs: 5000,
    });

    expect(mockJobRepo.enqueue).toHaveBeenCalledWith(
      'webhook.retry',
      { deliveryId: 'delivery-failed' },
      { maxAttempts: 5, delayMs: 5000 }
    );
  });
});
