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
} from './lib/metrics';
