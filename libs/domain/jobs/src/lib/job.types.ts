export type JobStatus =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'delayed'
  | 'dead_letter';

export type JobType =
  | 'webhook.delivery'
  | 'webhook.retry'
  | 'partner.usage.flush'
  | 'notification.dispatch'
  | 'audit.projection';

export interface JobPayloadMap {
  'webhook.delivery': {
    deliveryId: string;
    subscriptionId: string;
  };
  'webhook.retry': {
    deliveryId: string;
  };
  'partner.usage.flush': {
    partnerId: string;
  };
  'notification.dispatch': {
    notificationId: string;
  };
  'audit.projection': {
    aggregateId: string;
    aggregateType: string;
  };
}
