export const QUEUE_WEBHOOKS = 'webhooks';
export const QUEUE_NOTIFICATIONS = 'notifications';
export const QUEUE_AUDIT_PROJECTIONS = 'audit-projections';

export const DEFAULT_WEBHOOK_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: 1000,
  removeOnFail: 5000,
};
