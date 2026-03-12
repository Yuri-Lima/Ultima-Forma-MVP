import { createHmac } from 'node:crypto';
import type {
  ProfileChangeEvent,
  WebhookDelivery,
  WebhookDeliveryRepositoryPort,
  WebhookDispatcherPort,
  WebhookSubscriptionRepositoryPort,
} from '@ultima-forma/domain-webhook';

const RETRY_BACKOFF_MS = [60_000, 120_000, 240_000, 480_000, 960_000];
const FETCH_TIMEOUT_MS = 30_000;

function computeSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export class WebhookDispatcher implements WebhookDispatcherPort {
  constructor(
    private readonly subscriptionRepo: WebhookSubscriptionRepositoryPort,
    private readonly deliveryRepo: WebhookDeliveryRepositoryPort
  ) {}

  async dispatch(partnerId: string, event: ProfileChangeEvent): Promise<void> {
    const subscriptions =
      await this.subscriptionRepo.findActiveByPartnerAndEventType(
        partnerId,
        event.eventType
      );

    const payload = JSON.stringify({
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload,
      occurredAt: event.occurredAt.toISOString(),
    });

    for (const sub of subscriptions) {
      const delivery = await this.deliveryRepo.create({
        subscriptionId: sub.id,
        eventType: event.eventType,
        payload: JSON.parse(payload) as Record<string, unknown>,
      });

      void this.tryDeliver(delivery, sub.url, sub.secret);
    }
  }

  async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = await this.deliveryRepo.findById(deliveryId);
    if (!delivery || delivery.status === 'succeeded') return;

    const sub = await this.subscriptionRepo.findById(delivery.subscriptionId);
    if (!sub) return;

    const payload = JSON.stringify(delivery.payload);
    await this.tryDeliver(delivery, sub.url, sub.secret);
  }

  private async tryDeliver(
    delivery: WebhookDelivery,
    url: string,
    secret: string | null
  ): Promise<void> {
    const payload = JSON.stringify(delivery.payload);
    const nextAttempt = delivery.attempts + 1;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secret) {
      headers['X-Webhook-Signature'] = `sha256=${computeSignature(
        payload,
        secret
      )}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        await this.deliveryRepo.updateStatus(delivery.id, 'succeeded', {
          succeededAt: new Date(),
          attempts: nextAttempt,
        });
      } else {
        const errMsg = `HTTP ${res.status}: ${await res.text()}`;
        const backoffIdx = Math.min(nextAttempt - 1, RETRY_BACKOFF_MS.length - 1);
        await this.deliveryRepo.updateStatus(delivery.id, 'failed', {
          lastError: errMsg,
          attempts: nextAttempt,
          nextRetryAt: new Date(Date.now() + RETRY_BACKOFF_MS[backoffIdx]),
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const backoffIdx = Math.min(nextAttempt - 1, RETRY_BACKOFF_MS.length - 1);
      await this.deliveryRepo.updateStatus(delivery.id, 'failed', {
        lastError: errMsg,
        attempts: nextAttempt,
        nextRetryAt: new Date(Date.now() + RETRY_BACKOFF_MS[backoffIdx]),
      });
    }
  }
}
