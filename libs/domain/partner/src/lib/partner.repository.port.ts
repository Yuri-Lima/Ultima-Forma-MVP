import type { Consumer, Issuer, Partner } from './partner.types';

export interface CreateIssuerInput {
  partnerId: string;
  tenantId: string;
  name: string;
  scopes?: string[];
}

export interface CreateConsumerInput {
  partnerId: string;
  tenantId: string;
  name: string;
  scopes?: string[];
}

export interface RotateCredentialResult {
  credentialId: string;
  secret: string;
  secretHash: string;
}

export interface PartnerRepositoryPort {
  findPartnerById(id: string): Promise<Partner | null>;
  createIssuer(input: CreateIssuerInput): Promise<Issuer>;
  createConsumer(input: CreateConsumerInput): Promise<Consumer>;
  rotateIntegrationCredential(partnerId: string): Promise<RotateCredentialResult>;
}
