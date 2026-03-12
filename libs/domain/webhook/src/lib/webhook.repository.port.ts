import type {
  WebhookSubscription,
  WebhookDelivery,
  CreateWebhookSubscriptionInput,
  CreateWebhookDeliveryInput,
  ProfileChangeEvent,
} from './webhook.types';

export interface WebhookDeliveryFilters {
  status?: string;
  subscriptionId?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface WebhookSubscriptionRepositoryPort {
  create(input: CreateWebhookSubscriptionInput): Promise<WebhookSubscription>;
  findById(id: string): Promise<WebhookSubscription | null>;
  findByPartnerId(partnerId: string): Promise<WebhookSubscription[]>;
  findActiveByEventType(eventType: string): Promise<WebhookSubscription[]>;
  findActiveByPartnerAndEventType(
    partnerId: string,
    eventType: string
  ): Promise<WebhookSubscription[]>;
}

export interface WebhookDeliveryRepositoryPort {
  create(input: CreateWebhookDeliveryInput): Promise<WebhookDelivery>;
  findById(id: string): Promise<WebhookDelivery | null>;
  findPendingForRetry(limit?: number): Promise<WebhookDelivery[]>;
  findMany(
    filters?: WebhookDeliveryFilters,
    pagination?: PaginationOptions
  ): Promise<WebhookDelivery[]>;
  count(filters?: WebhookDeliveryFilters): Promise<number>;
  updateStatus(
    id: string,
    status: 'pending' | 'succeeded' | 'failed',
    opts?: { lastError?: string; nextRetryAt?: Date; succeededAt?: Date; attempts?: number }
  ): Promise<void>;
}

export interface WebhookDispatcherPort {
  dispatch(partnerId: string, event: ProfileChangeEvent): Promise<void>;
}
