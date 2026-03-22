import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { QueueEvents } from 'bullmq';
import {
  QUEUE_WEBHOOKS,
  QUEUE_NOTIFICATIONS,
  QUEUE_AUDIT_PROJECTIONS,
} from '@ultima-forma/domain-jobs';
import {
  logger,
  queueJobsCompletedTotal,
  queueJobsFailedTotal,
  queueJobDurationMs,
  webhookJobsRetryTotal,
} from '@ultima-forma/shared-logger';
import { getRedisConnectionConfig, getQueuePrefix } from './queue.config';
import type { WebhookDeliveryRepositoryPort } from '@ultima-forma/domain-webhook';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';

export const QUEUE_EVENTS_WEBHOOK_DELIVERY_REPOSITORY =
  'QUEUE_EVENTS_WEBHOOK_DELIVERY_REPOSITORY';
export const QUEUE_EVENTS_AUDIT_REPOSITORY = 'QUEUE_EVENTS_AUDIT_REPOSITORY';

@Injectable()
export class QueueEventsService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents[] = [];

  constructor(
    @InjectQueue(QUEUE_WEBHOOKS) private readonly webhooksQueue: Queue,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUE_AUDIT_PROJECTIONS) private readonly auditQueue: Queue,
    @Optional()
    @Inject(QUEUE_EVENTS_WEBHOOK_DELIVERY_REPOSITORY)
    private readonly deliveryRepo?: WebhookDeliveryRepositoryPort,
    @Optional()
    @Inject(QUEUE_EVENTS_AUDIT_REPOSITORY)
    private readonly auditRepo?: AuditRepositoryPort
  ) {}

  async onModuleInit(): Promise<void> {
    const connection = getRedisConnectionConfig();
    const prefix = getQueuePrefix();

    for (const queueName of [
      QUEUE_WEBHOOKS,
      QUEUE_NOTIFICATIONS,
      QUEUE_AUDIT_PROJECTIONS,
    ]) {
      const queueEvents = new QueueEvents(queueName, {
        connection,
        prefix,
      });

      queueEvents.on('completed', async ({ jobId }) => {
        await this.handleCompleted(queueName, jobId);
      });

      queueEvents.on('failed', async ({ jobId, failedReason }) => {
        await this.handleFailed(queueName, jobId, failedReason ?? 'Unknown');
      });

      queueEvents.on('stalled', ({ jobId }) => {
        logger.warn('Queue job stalled', { queueName, jobId });
      });

      this.queueEvents.push(queueEvents);
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const qe of this.queueEvents) {
      await qe.close();
    }
  }

  private async handleCompleted(
    queueName: string,
    jobId: string
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) return;

    const jobName = job.name;
    const returnvalue = job.returnvalue as { durationMs?: number } | undefined;
    const durationMs = returnvalue?.durationMs ?? 0;

    queueJobsCompletedTotal.inc({ queue: queueName, job_name: jobName });
    queueJobDurationMs.observe({ queue: queueName, job_name: jobName }, durationMs);

    logger.info('Queue job completed', {
      jobId,
      queueName,
      jobName,
      attemptsMade: job.attemptsMade,
      durationMs,
      deliveryId: (job.data as { deliveryId?: string })?.deliveryId,
    });
  }

  private async handleFailed(
    queueName: string,
    jobId: string,
    failedReason: string
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) return;

    const jobName = job.name;
    const attemptsMade = job.attemptsMade ?? 0;
    const maxAttempts = job.opts?.attempts ?? 5;

    queueJobsFailedTotal.inc({ queue: queueName, job_name: jobName });
    if (jobName === 'webhook.delivery' || jobName === 'webhook.retry') {
      webhookJobsRetryTotal.inc();
    }

    logger.warn('Queue job failed', {
      jobId,
      queueName,
      jobName,
      attemptsMade,
      failedReason,
      deliveryId: (job.data as { deliveryId?: string })?.deliveryId,
    });

    if (attemptsMade >= maxAttempts && queueName === QUEUE_WEBHOOKS) {
      const data = job.data as { deliveryId?: string };
      if (data?.deliveryId) {
        await this.handleWebhookDeadLetter(data.deliveryId, failedReason);
      }
    }
  }

  private async handleWebhookDeadLetter(
    deliveryId: string,
    lastError: string
  ): Promise<void> {
    if (!this.deliveryRepo || !this.auditRepo) {
      logger.warn('Webhook dead letter: repositories not injected, skipping DB update', {
        deliveryId,
        lastError,
      });
      return;
    }
    try {
      await this.deliveryRepo.updateStatus(deliveryId, 'failed', {
        lastError,
        attempts: 5,
      });
      await this.auditRepo.append({
        eventType: 'webhook_delivery_dead_letter',
        aggregateType: 'webhook_delivery',
        aggregateId: deliveryId,
        payload: { deliveryId, lastError },
      });
    } catch (err) {
      logger.error('Failed to handle webhook dead letter', {
        deliveryId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private getQueue(queueName: string): Queue {
    switch (queueName) {
      case QUEUE_WEBHOOKS:
        return this.webhooksQueue;
      case QUEUE_NOTIFICATIONS:
        return this.notificationsQueue;
      case QUEUE_AUDIT_PROJECTIONS:
        return this.auditQueue;
      default:
        return this.webhooksQueue;
    }
  }
}
