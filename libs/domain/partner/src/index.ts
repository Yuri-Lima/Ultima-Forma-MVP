export {
  type PartnerStatus,
  type Tenant,
  type Partner,
  type Issuer,
  type Consumer,
  type IntegrationCredential,
} from './lib/partner.types';

export type {
  PartnerRepositoryPort,
  CreateIssuerInput,
  CreateConsumerInput,
  RotateCredentialResult,
} from './lib/partner.repository.port';
