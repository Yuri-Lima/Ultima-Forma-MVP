import { Module } from '@nestjs/common';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type {
  AuditRepositoryPort,
  BillableEventRepositoryPort,
} from '@ultima-forma/domain-audit';
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
  GetDataRequestResultForConsumerUseCase,
} from '@ultima-forma/application-consent';
import {
  DRIZZLE,
  type DrizzleDB,
  PartnerRepository,
  ConsentRepository,
  AuditRepository,
  BillableEventRepository,
} from '@ultima-forma/infrastructure-drizzle';
import { IssuersController } from './issuers.controller';
import { ConsumersController } from './consumers.controller';
import { IntegrationCredentialsController } from './integration-credentials.controller';
import { DataRequestsController } from './data-requests.controller';
import { ConsentsController } from './consents.controller';

export const PARTNER_REPOSITORY = 'PARTNER_REPOSITORY';
export const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';
export const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';
export const BILLABLE_EVENT_REPOSITORY = 'BILLABLE_EVENT_REPOSITORY';

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
      provide: AUDIT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new AuditRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: BILLABLE_EVENT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new BillableEventRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: CreateDataRequestUseCase,
      useFactory: (
        consentRepo: ConsentRepositoryPort,
        partnerRepo: PartnerRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) =>
        new CreateDataRequestUseCase(consentRepo, partnerRepo, auditRepo),
      inject: [CONSENT_REPOSITORY, PARTNER_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: ApproveConsentUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort,
        billableRepo: BillableEventRepositoryPort
      ) => new ApproveConsentUseCase(repo, auditRepo, billableRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY, BILLABLE_EVENT_REPOSITORY],
    },
    {
      provide: RejectConsentUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) => new RejectConsentUseCase(repo, auditRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: ExpireRequestUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) => new ExpireRequestUseCase(repo, auditRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: GetDataRequestForUserUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetDataRequestForUserUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: GetDataRequestResultForConsumerUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetDataRequestResultForConsumerUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
  ],
})
export class V1Module {}
