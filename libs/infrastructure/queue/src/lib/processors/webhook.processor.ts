import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import type { Job } from 'bullmq';
import { QUEUE_WEBHOOKS } from '@ultima-forma/domain-jobs';
import { getConfig } from '@ultima-forma/shared-config';
import type {
  WebhookDeliveryRepositoryPort,
  WebhookSubscriptionRepositoryPort,
} from '@ultima-forma/domain-webhook';
import { WebhookHttpDeliveryService } from '../webhook-http-delivery.service';

export const WEBHOOK_DELIVERY_REPOSITORY = 'WEBHOOK_DELIVERY_REPOSITORY';
export const WEBHOOK_SUBSCRIPTION_REPOSITORY = 'WEBHOOK_SUBSCRIPTION_REPOSITORY';

@Processor(QUEUE_WEBHOOKS, {
  concurrency: getConfig().queue.webhookConcurrency,
})
@Injectable()
export class WebhookProcessor extends WorkerHost {
  constructor(
    private readonly httpDelivery: WebhookHttpDeliveryService,
    @Inject(WEBHOOK_DELIVERY_REPOSITORY)
    private readonly deliveryRepo: WebhookDeliveryRepositoryPort,
    @Inject(WEBHOOK_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: WebhookSubscriptionRepositoryPort
  ) {
    super();
  }

  async process(job: Job): Promise<{ durationMs: number }> {
    const start = Date.now();
    const { name: jobName, data } = job;

    if (jobName === 'webhook.delivery') {
      return this.processDelivery(
        data as { deliveryId: string; subscriptionId: string },
        start
      );
    }
    if (jobName === 'webhook.retry') {
      return this.processRetry(
        data as { deliveryId: string },
        start
      );
    }

    throw new Error(`Unknown job type: ${jobName}`);
  }

  private async processDelivery(
    data: { deliveryId: string; subscriptionId: string },
    start: number
  ): Promise<{ durationMs: number }> {
    const { deliveryId, subscriptionId } = data;

    const delivery = await this.deliveryRepo.findById(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery not found: ${deliveryId}`);
    }

    const sub = await this.subscriptionRepo.findById(subscriptionId);
    if (!sub) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const result = await this.httpDelivery.deliver(
      delivery,
      sub.url,
      sub.secret
    );

    const nextAttempt = delivery.attempts + 1;
    const durationMs = Date.now() - start;

    if (result.success) {
      await this.deliveryRepo.updateStatus(deliveryId, 'succeeded', {
        succeededAt: new Date(),
        attempts: nextAttempt,
      });
      return { durationMs };
    }

    await this.deliveryRepo.updateStatus(deliveryId, 'failed', {
      lastError: result.error ?? 'Unknown error',
      attempts: nextAttempt,
    });
    throw new Error(result.error ?? 'Webhook delivery failed');
  }

  private async processRetry(
    data: { deliveryId: string },
    start: number
  ): Promise<{ durationMs: number }> {
    const { deliveryId } = data;

    const delivery = await this.deliveryRepo.findById(deliveryId);
    if (!delivery || delivery.status === 'succeeded') {
      return { durationMs: Date.now() - start };
    }

    const sub = await this.subscriptionRepo.findById(delivery.subscriptionId);
    if (!sub) {
      throw new Error(`Subscription not found: ${delivery.subscriptionId}`);
    }

    const result = await this.httpDelivery.deliver(
      delivery,
      sub.url,
      sub.secret
    );

    const nextAttempt = delivery.attempts + 1;
    const durationMs = Date.now() - start;

    if (result.success) {
      await this.deliveryRepo.updateStatus(deliveryId, 'succeeded', {
        succeededAt: new Date(),
        attempts: nextAttempt,
      });
      return { durationMs };
    }

    await this.deliveryRepo.updateStatus(deliveryId, 'failed', {
      lastError: result.error ?? 'Unknown error',
      attempts: nextAttempt,
    });
    throw new Error(result.error ?? 'Webhook retry failed');
  }
}
