export type RequestStatus = 'pending' | 'expired' | 'completed' | 'rejected';

export type ConsentStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export type TrustLevel = 'low' | 'medium' | 'high' | 'verified';

export interface VerificationResult {
  trustLevel: TrustLevel;
  verifiedAt: Date;
  verifiedClaims?: string[];
}

export interface ReceiptData {
  approved: boolean;
  timestamp: string;
  requestId: string;
  consentId: string;
  trustLevel: TrustLevel;
  verificationResult?: VerificationResult;
}

export interface DataRequest {
  id: string;
  consumerId: string;
  tenantId: string;
  status: RequestStatus;
  purpose: string;
  expiresAt: Date;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestItem {
  id: string;
  dataRequestId: string;
  claim: string;
  createdAt: Date;
}

export interface Consent {
  id: string;
  dataRequestId: string;
  status: ConsentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentReceipt {
  id: string;
  consentId: string;
  approved: boolean;
  receiptData: Record<string, unknown>;
  createdAt: Date;
}

export interface DataRequestResultForConsumer {
  requestId: string;
  status: RequestStatus;
  consumerId: string;
  consumerName: string;
  purpose: string;
  claims: string[];
  expiresAt: Date;
  createdAt: Date;
  receipt?: {
    id: string;
    approved: boolean;
    trustLevel: TrustLevel;
    verificationResult?: VerificationResult;
  };
}

export interface DataRequestListItem extends DataRequest {
  consumerName: string;
}

export interface ListDataRequestsFilters {
  status?: RequestStatus;
  tenantId?: string;
}

export interface ListDataRequestsPagination {
  limit?: number;
  offset?: number;
}

export interface ConsentPolicy {
  id: string;
  tenantId: string;
  name: string;
  maxDurationHours: number;
  allowedClaims: string[];
  jurisdiction: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentRevocation {
  id: string;
  consentId: string;
  reason: string | null;
  revokedBy: string;
  createdAt: Date;
}

export interface ConsentWithDetails {
  consent: Consent;
  dataRequest: DataRequest;
  claims: string[];
  consumerName: string;
  revocation?: ConsentRevocation;
}

export interface ListConsentsFilters {
  tenantId?: string;
  status?: ConsentStatus;
}

export interface CreateConsentPolicyInput {
  tenantId: string;
  name: string;
  maxDurationHours: number;
  allowedClaims: string[];
  jurisdiction?: string;
}
