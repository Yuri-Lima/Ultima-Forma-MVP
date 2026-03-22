import { createHmac } from 'node:crypto';
import type { WebhookDelivery } from '@ultima-forma/domain-webhook';

const FETCH_TIMEOUT_MS = 30_000;

function computeSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export interface WebhookHttpDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export class WebhookHttpDeliveryService {
  async deliver(
    delivery: WebhookDelivery,
    url: string,
    secret: string | null
  ): Promise<WebhookHttpDeliveryResult> {
    const payload = JSON.stringify(delivery.payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secret) {
      headers['X-Webhook-Signature'] = `sha256=${computeSignature(payload, secret)}`;
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
        return { success: true, statusCode: res.status };
      }

      const text = await res.text();
      return {
        success: false,
        statusCode: res.status,
        error: `HTTP ${res.status}: ${text}`,
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  }
}
