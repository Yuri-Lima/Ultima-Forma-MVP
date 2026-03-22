import type { JobPayloadMap } from './job.types';

export interface JobRepositoryPort {
  enqueue<T extends keyof JobPayloadMap>(
    type: T,
    payload: JobPayloadMap[T],
    options?: {
      delayMs?: number;
      maxAttempts?: number;
      deduplicationKey?: string;
    }
  ): Promise<{ jobId: string }>;
}
