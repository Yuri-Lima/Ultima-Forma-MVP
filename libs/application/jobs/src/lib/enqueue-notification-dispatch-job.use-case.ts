import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

export class EnqueueNotificationDispatchJobUseCase {
  constructor(private readonly jobRepo: JobRepositoryPort) {}

  async execute(input: {
    notificationId: string;
    delayMs?: number;
    deduplicationKey?: string;
  }): Promise<{ jobId: string }> {
    return this.jobRepo.enqueue('notification.dispatch', {
      notificationId: input.notificationId,
    }, {
      delayMs: input.delayMs,
      deduplicationKey: input.deduplicationKey,
    });
  }
}
