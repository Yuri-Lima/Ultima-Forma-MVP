import type {
  ProfileChangeEvent,
  WebhookDeliveryRepositoryPort,
  WebhookDispatcherPort,
  WebhookSubscriptionRepositoryPort,
} from '@ultima-forma/domain-webhook';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

export class AsyncWebhookDispatcher implements WebhookDispatcherPort {
  constructor(
    private readonly subscriptionRepo: WebhookSubscriptionRepositoryPort,
    private readonly deliveryRepo: WebhookDeliveryRepositoryPort,
    private readonly jobRepo: JobRepositoryPort
  ) {}

  async dispatch(partnerId: string, event: ProfileChangeEvent): Promise<void> {
    const subscriptions =
      await this.subscriptionRepo.findActiveByPartnerAndEventType(
        partnerId,
        event.eventType
      );

    const payload = {
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload,
      occurredAt: event.occurredAt.toISOString(),
    };

    for (const sub of subscriptions) {
      const delivery = await this.deliveryRepo.create({
        subscriptionId: sub.id,
        eventType: event.eventType,
        payload,
      });

      await this.jobRepo.enqueue('webhook.delivery', {
        deliveryId: delivery.id,
        subscriptionId: sub.id,
      }, {
        maxAttempts: 5,
      });
    }
  }
}
