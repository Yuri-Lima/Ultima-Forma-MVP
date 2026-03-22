import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { JobPayloadMap, JobRepositoryPort } from '@ultima-forma/domain-jobs';
import {
  QUEUE_WEBHOOKS,
  QUEUE_NOTIFICATIONS,
  QUEUE_AUDIT_PROJECTIONS,
  DEFAULT_WEBHOOK_JOB_OPTIONS,
} from '@ultima-forma/domain-jobs';
import { queueJobsEnqueuedTotal } from '@ultima-forma/shared-logger';

const JOB_OPTIONS = {
  attempts: DEFAULT_WEBHOOK_JOB_OPTIONS.attempts,
  backoff: DEFAULT_WEBHOOK_JOB_OPTIONS.backoff,
  removeOnComplete: DEFAULT_WEBHOOK_JOB_OPTIONS.removeOnComplete,
  removeOnFail: DEFAULT_WEBHOOK_JOB_OPTIONS.removeOnFail,
};

@Injectable()
export class BullMqJobRepository implements JobRepositoryPort {
  constructor(
    @InjectQueue(QUEUE_WEBHOOKS) private readonly webhooksQueue: Queue,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUE_AUDIT_PROJECTIONS) private readonly auditQueue: Queue
  ) {}

  async enqueue<T extends keyof JobPayloadMap>(
    type: T,
    payload: JobPayloadMap[T],
    options?: {
      delayMs?: number;
      maxAttempts?: number;
      deduplicationKey?: string;
    }
  ): Promise<{ jobId: string }> {
    const queue = this.getQueueForType(type);
    const opts: { delay?: number; attempts?: number; jobId?: string } = {
      ...JOB_OPTIONS,
    };
    if (options?.delayMs) opts.delay = options.delayMs;
    if (options?.maxAttempts) opts.attempts = options.maxAttempts;
    if (options?.deduplicationKey) opts.jobId = options.deduplicationKey;

    const job = await queue.add(type, payload as object, opts);
    const queueName = this.getQueueNameForType(type);
    queueJobsEnqueuedTotal.inc({ queue: queueName, job_name: type });
    return { jobId: job.id ?? String(job.id) };
  }

  private getQueueNameForType(type: keyof JobPayloadMap): string {
    switch (type) {
      case 'webhook.delivery':
      case 'webhook.retry':
        return QUEUE_WEBHOOKS;
      case 'notification.dispatch':
        return QUEUE_NOTIFICATIONS;
      case 'audit.projection':
      case 'partner.usage.flush':
        return QUEUE_AUDIT_PROJECTIONS;
      default:
        return QUEUE_WEBHOOKS;
    }
  }

  private getQueueForType(type: keyof JobPayloadMap): Queue {
    switch (type) {
      case 'webhook.delivery':
      case 'webhook.retry':
        return this.webhooksQueue;
      case 'notification.dispatch':
        return this.notificationsQueue;
      case 'audit.projection':
      case 'partner.usage.flush':
        return this.auditQueue;
      default:
        return this.webhooksQueue;
    }
  }
}
