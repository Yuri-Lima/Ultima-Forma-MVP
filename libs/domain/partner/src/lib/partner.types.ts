export type PartnerStatus = 'active' | 'inactive' | 'revoked';

export interface Tenant {
  id: string;
  name: string;
  status: PartnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  tenantId: string;
  name: string;
  status: PartnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Issuer {
  id: string;
  partnerId: string;
  tenantId: string;
  name: string;
  status: PartnerStatus;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Consumer {
  id: string;
  partnerId: string;
  tenantId: string;
  name: string;
  status: PartnerStatus;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationCredential {
  id: string;
  partnerId: string;
  secretHash: string;
  encryptedSecret: string | null;
  status: PartnerStatus;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface PartnerApiNonce {
  id: string;
  partnerId: string;
  nonceHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PartnerApiUsage {
  id: string;
  partnerId: string;
  route: string;
  method: string;
  statusCode: number;
  correlationId: string | null;
  responseTimeMs: number | null;
  createdAt: Date;
}

export interface PartnerDashboardMetrics {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalApiCalls: number;
  failedApiCalls: number;
  activeCredentials: number;
  activeWebhooks: number;
}

export interface WebhookSubscriptionSummary {
  id: string;
  url: string;
  eventTypes: string[];
  status: string;
  createdAt: Date;
}

export interface CreateWebhookInput {
  partnerId: string;
  url: string;
  eventTypes: string[];
  secret?: string;
}

export interface UpdateWebhookInput {
  url?: string;
  eventTypes?: string[];
  status?: string;
}
