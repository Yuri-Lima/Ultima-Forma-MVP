export { logger, type Logger, type LogLevel } from './lib/logger';
export {
  metricsRegistry,
  httpRequestsTotal,
  httpRequestDurationMs,
  dataRequestsCreatedTotal,
  consentsApprovedTotal,
  consentsRejectedTotal,
  consentsRevokedTotal,
  webhookDeliveryFailedTotal,
  partnerAuthFailedTotal,
  queueJobsEnqueuedTotal,
  queueJobsCompletedTotal,
  queueJobsFailedTotal,
  queueJobDurationMs,
  queueJobsActive,
  webhookJobsRetryTotal,
} from './lib/metrics';
