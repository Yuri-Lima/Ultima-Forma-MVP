import { EnqueueWebhookDeliveryJobUseCase } from './enqueue-webhook-delivery-job.use-case';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

describe('EnqueueWebhookDeliveryJobUseCase', () => {
  const mockJobRepo: jest.Mocked<JobRepositoryPort> = {
    enqueue: jest.fn(),
  };

  const useCase = new EnqueueWebhookDeliveryJobUseCase(mockJobRepo);

  beforeEach(() => jest.clearAllMocks());

  it('should enqueue webhook.delivery job with deliveryId and subscriptionId', async () => {
    mockJobRepo.enqueue.mockResolvedValue({ jobId: 'job-123' });

    const result = await useCase.execute({
      deliveryId: 'delivery-1',
      subscriptionId: 'sub-1',
    });

    expect(mockJobRepo.enqueue).toHaveBeenCalledWith(
      'webhook.delivery',
      { deliveryId: 'delivery-1', subscriptionId: 'sub-1' },
      { maxAttempts: 5 }
    );
    expect(result.jobId).toBe('job-123');
  });

  it('should pass delayMs when provided', async () => {
    mockJobRepo.enqueue.mockResolvedValue({ jobId: 'job-456' });

    await useCase.execute({
      deliveryId: 'delivery-2',
      subscriptionId: 'sub-2',
      delayMs: 10000,
    });

    expect(mockJobRepo.enqueue).toHaveBeenCalledWith(
      'webhook.delivery',
      { deliveryId: 'delivery-2', subscriptionId: 'sub-2' },
      { maxAttempts: 5, delayMs: 10000 }
    );
  });

  it('should pass deduplicationKey when provided', async () => {
    mockJobRepo.enqueue.mockResolvedValue({ jobId: 'job-789' });

    await useCase.execute({
      deliveryId: 'delivery-3',
      subscriptionId: 'sub-3',
      deduplicationKey: 'delivery-3-sub-3',
    });

    expect(mockJobRepo.enqueue).toHaveBeenCalledWith(
      'webhook.delivery',
      { deliveryId: 'delivery-3', subscriptionId: 'sub-3' },
      { maxAttempts: 5, deduplicationKey: 'delivery-3-sub-3' }
    );
  });
});
