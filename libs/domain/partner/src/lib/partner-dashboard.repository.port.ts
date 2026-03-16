import type {
  CreateWebhookInput,
  IntegrationCredential,
  PartnerDashboardMetrics,
  UpdateWebhookInput,
  WebhookSubscriptionSummary,
} from './partner.types';
import type { DataRequestListItem, ListDataRequestsPagination } from '@ultima-forma/domain-consent';

export interface PartnerDashboardRepositoryPort {
  getDashboardMetrics(partnerId: string): Promise<PartnerDashboardMetrics>;
  listPartnerRequests(
    partnerId: string,
    filters?: { status?: string },
    pagination?: ListDataRequestsPagination
  ): Promise<{ items: DataRequestListItem[]; total: number }>;
  listPartnerCredentials(
    partnerId: string
  ): Promise<IntegrationCredential[]>;
  listPartnerWebhooks(
    partnerId: string
  ): Promise<WebhookSubscriptionSummary[]>;
  createWebhook(
    input: CreateWebhookInput
  ): Promise<WebhookSubscriptionSummary>;
  updateWebhook(
    id: string,
    input: UpdateWebhookInput
  ): Promise<WebhookSubscriptionSummary>;
}
