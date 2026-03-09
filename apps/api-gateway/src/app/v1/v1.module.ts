import { Module } from '@nestjs/common';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import {
  CreateConsumerUseCase,
  CreateIssuerUseCase,
  RotateIntegrationCredentialUseCase,
} from '@ultima-forma/application-partner';
import {
  DRIZZLE,
  type DrizzleDB,
  PartnerRepository,
} from '@ultima-forma/infrastructure-drizzle';
import { IssuersController } from './issuers.controller';
import { ConsumersController } from './consumers.controller';
import { IntegrationCredentialsController } from './integration-credentials.controller';

export const PARTNER_REPOSITORY = 'PARTNER_REPOSITORY';

@Module({
  imports: [],
  controllers: [
    IssuersController,
    ConsumersController,
    IntegrationCredentialsController,
  ],
  providers: [
    {
      provide: PARTNER_REPOSITORY,
      useFactory: (db: DrizzleDB) => new PartnerRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: CreateIssuerUseCase,
      useFactory: (repo: PartnerRepositoryPort) => new CreateIssuerUseCase(repo),
      inject: [PARTNER_REPOSITORY],
    },
    {
      provide: CreateConsumerUseCase,
      useFactory: (repo: PartnerRepositoryPort) =>
        new CreateConsumerUseCase(repo),
      inject: [PARTNER_REPOSITORY],
    },
    {
      provide: RotateIntegrationCredentialUseCase,
      useFactory: (repo: PartnerRepositoryPort) =>
        new RotateIntegrationCredentialUseCase(repo),
      inject: [PARTNER_REPOSITORY],
    },
  ],
})
export class V1Module {}
