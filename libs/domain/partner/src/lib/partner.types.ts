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
  status: PartnerStatus;
  createdAt: Date;
  expiresAt: Date | null;
}
