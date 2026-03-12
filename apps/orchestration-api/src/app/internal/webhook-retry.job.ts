import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { WebhookDeliveryRepositoryPort } from '@ultima-forma/domain-webhook';
import {
  WebhookDeliveryRepository,
  WebhookDispatcher,
} from '@ultima-forma/infrastructure-drizzle';
import { logger } from '@ultima-forma/shared-logger';

const WEBHOOK_DELIVERY_REPOSITORY = 'WEBHOOK_DELIVERY_REPOSITORY';

@Injectable()
export class WebhookRetryJob {
  constructor(
    @Inject(WEBHOOK_DELIVERY_REPOSITORY)
    private readonly deliveryRepo: WebhookDeliveryRepositoryPort,
    private readonly dispatcher: WebhookDispatcher
  ) {}

  @Cron('* * * * *')
  async handleRetry() {
    const pending = await this.deliveryRepo.findPendingForRetry(20);
    for (const delivery of pending) {
      try {
        await this.dispatcher.retryDelivery(delivery.id);
      } catch (err) {
        logger.error('WebhookRetryJob: failed to retry delivery', {
          deliveryId: delivery.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
}
