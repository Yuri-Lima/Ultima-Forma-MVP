import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

export class EnqueueWebhookRetryJobUseCase {
  constructor(private readonly jobRepo: JobRepositoryPort) {}

  async execute(input: {
    deliveryId: string;
    delayMs?: number;
  }): Promise<{ jobId: string }> {
    return this.jobRepo.enqueue('webhook.retry', {
      deliveryId: input.deliveryId,
    }, {
      delayMs: input.delayMs,
      maxAttempts: 5,
    });
  }
}
