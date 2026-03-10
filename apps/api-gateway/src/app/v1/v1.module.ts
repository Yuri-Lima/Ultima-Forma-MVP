import { Module } from '@nestjs/common';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import {
  CreateConsumerUseCase,
  CreateIssuerUseCase,
  RotateIntegrationCredentialUseCase,
} from '@ultima-forma/application-partner';
import {
  CreateDataRequestUseCase,
  ApproveConsentUseCase,
  RejectConsentUseCase,
  ExpireRequestUseCase,
  GetDataRequestForUserUseCase,
} from '@ultima-forma/application-consent';
import {
  DRIZZLE,
  type DrizzleDB,
  PartnerRepository,
  ConsentRepository,
} from '@ultima-forma/infrastructure-drizzle';
import { IssuersController } from './issuers.controller';
import { ConsumersController } from './consumers.controller';
import { IntegrationCredentialsController } from './integration-credentials.controller';
import { DataRequestsController } from './data-requests.controller';
import { ConsentsController } from './consents.controller';

export const PARTNER_REPOSITORY = 'PARTNER_REPOSITORY';
export const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';

@Module({
  imports: [],
  controllers: [
    IssuersController,
    ConsumersController,
    IntegrationCredentialsController,
    DataRequestsController,
    ConsentsController,
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
    {
      provide: CONSENT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new ConsentRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: CreateDataRequestUseCase,
      useFactory: (
        consentRepo: ConsentRepositoryPort,
        partnerRepo: PartnerRepositoryPort
      ) =>
        new CreateDataRequestUseCase(consentRepo, partnerRepo),
      inject: [CONSENT_REPOSITORY, PARTNER_REPOSITORY],
    },
    {
      provide: ApproveConsentUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new ApproveConsentUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: RejectConsentUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new RejectConsentUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: ExpireRequestUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new ExpireRequestUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: GetDataRequestForUserUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetDataRequestForUserUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
  ],
})
export class V1Module {}
