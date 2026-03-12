export type {
  CreateConsumerInput,
  CreateIssuerInput,
  PartnerRepositoryPort,
  RotateCredentialResult,
  UpdateConsumerInput,
  UpdateIssuerInput,
} from '@ultima-forma/domain-partner';
export { CreateIssuerUseCase } from './lib/create-issuer.use-case';
export { CreateConsumerUseCase } from './lib/create-consumer.use-case';
export { UpdateIssuerUseCase } from './lib/update-issuer.use-case';
export { UpdateConsumerUseCase } from './lib/update-consumer.use-case';
export { RotateIntegrationCredentialUseCase } from './lib/rotate-integration-credential.use-case';
