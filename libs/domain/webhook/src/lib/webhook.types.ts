export type ProfileChangeEventType = 'issuer.updated' | 'consumer.updated';

export interface ProfileChangeEvent {
  eventType: ProfileChangeEventType;
  aggregateType: 'issuer' | 'consumer';
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export interface UpdateNotification extends ProfileChangeEvent {
  deliveryId?: string;
}

export type WebhookSubscriptionStatus = 'active' | 'inactive';

export interface WebhookSubscription {
  id: string;
  partnerId: string;
  url: string;
  secret: string | null;
  eventTypes: string[];
  status: WebhookSubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookDeliveryStatus = 'pending' | 'succeeded' | 'failed';

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  lastError: string | null;
  nextRetryAt: Date | null;
  succeededAt: Date | null;
  createdAt: Date;
}

export interface CreateWebhookSubscriptionInput {
  partnerId: string;
  url: string;
  secret?: string;
  eventTypes?: string[];
}

export interface CreateWebhookDeliveryInput {
  subscriptionId: string;
  eventType: string;
  payload: Record<string, unknown>;
}
