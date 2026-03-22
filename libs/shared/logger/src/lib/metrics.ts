import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

export const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'] as const,
  registers: [metricsRegistry],
});

export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'path', 'status'] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [metricsRegistry],
});

export const dataRequestsCreatedTotal = new Counter({
  name: 'data_requests_created_total',
  help: 'Total data requests created',
  registers: [metricsRegistry],
});

export const consentsApprovedTotal = new Counter({
  name: 'consents_approved_total',
  help: 'Total consents approved',
  registers: [metricsRegistry],
});

export const consentsRejectedTotal = new Counter({
  name: 'consents_rejected_total',
  help: 'Total consents rejected',
  registers: [metricsRegistry],
});

export const consentsRevokedTotal = new Counter({
  name: 'consents_revoked_total',
  help: 'Total consents revoked',
  registers: [metricsRegistry],
});

export const webhookDeliveryFailedTotal = new Counter({
  name: 'webhook_delivery_failed_total',
  help: 'Total webhook delivery failures',
  registers: [metricsRegistry],
});

export const partnerAuthFailedTotal = new Counter({
  name: 'partner_auth_failed_total',
  help: 'Total partner authentication failures',
  registers: [metricsRegistry],
});

// Queue / BullMQ metrics
export const queueJobsEnqueuedTotal = new Counter({
  name: 'queue_jobs_enqueued_total',
  help: 'Total jobs enqueued',
  labelNames: ['queue', 'job_name'] as const,
  registers: [metricsRegistry],
});

export const queueJobsCompletedTotal = new Counter({
  name: 'queue_jobs_completed_total',
  help: 'Total jobs completed',
  labelNames: ['queue', 'job_name'] as const,
  registers: [metricsRegistry],
});

export const queueJobsFailedTotal = new Counter({
  name: 'queue_jobs_failed_total',
  help: 'Total jobs failed',
  labelNames: ['queue', 'job_name'] as const,
  registers: [metricsRegistry],
});

export const queueJobDurationMs = new Histogram({
  name: 'queue_job_duration_ms',
  help: 'Job processing duration in milliseconds',
  labelNames: ['queue', 'job_name'] as const,
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [metricsRegistry],
});

export const queueJobsActive = new Gauge({
  name: 'queue_jobs_active',
  help: 'Number of active jobs',
  labelNames: ['queue'] as const,
  registers: [metricsRegistry],
});

export const webhookJobsRetryTotal = new Counter({
  name: 'webhook_jobs_retry_total',
  help: 'Total webhook job retries',
  registers: [metricsRegistry],
});
