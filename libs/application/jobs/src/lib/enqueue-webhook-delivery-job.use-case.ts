import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

export class EnqueueWebhookDeliveryJobUseCase {
  constructor(private readonly jobRepo: JobRepositoryPort) {}

  async execute(input: {
    deliveryId: string;
    subscriptionId: string;
    delayMs?: number;
    deduplicationKey?: string;
  }): Promise<{ jobId: string }> {
    return this.jobRepo.enqueue('webhook.delivery', {
      deliveryId: input.deliveryId,
      subscriptionId: input.subscriptionId,
    }, {
      delayMs: input.delayMs,
      deduplicationKey: input.deduplicationKey,
      maxAttempts: 5,
    });
  }
}
