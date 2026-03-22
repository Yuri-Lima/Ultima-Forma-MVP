import { Module } from '@nestjs/common';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type {
  AuditRepositoryPort,
  BillableEventRepositoryPort,
} from '@ultima-forma/domain-audit';
import type { PartnerRepositoryPort } from '@ultima-forma/domain-partner';
import {
  ApproveConsentUseCase,
  GetConsentHistoryUseCase,
  RejectConsentUseCase,
} from '@ultima-forma/application-consent';
import { RotateIntegrationCredentialUseCase } from '@ultima-forma/application-partner';
import { getConfig } from '@ultima-forma/shared-config';
import {
  DRIZZLE,
  type DrizzleDB,
  ConsentRepository,
  AuditRepository,
  BillableEventRepository,
  PartnerRepository,
  WebhookSubscriptionRepository,
  WebhookDeliveryRepository,
  WebhookDispatcher,
} from '@ultima-forma/infrastructure-drizzle';
import {
  AsyncWebhookDispatcher,
  JOB_REPOSITORY,
} from '@ultima-forma/infrastructure-queue';
import type {
  WebhookSubscriptionRepositoryPort,
  WebhookDeliveryRepositoryPort,
} from '@ultima-forma/domain-webhook';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';
import { ConsentsController } from './consents.controller';
import { CredentialsController } from './credentials.controller';
import { RequestsController } from './requests.controller';
import { AuditController } from './audit.controller';
import { WebhookDeliveriesController } from './webhook-deliveries.controller';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';
const PARTNER_REPOSITORY = 'PARTNER_REPOSITORY';
const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';
const BILLABLE_EVENT_REPOSITORY = 'BILLABLE_EVENT_REPOSITORY';
const WEBHOOK_SUBSCRIPTION_REPOSITORY = 'WEBHOOK_SUBSCRIPTION_REPOSITORY';
const WEBHOOK_DELIVERY_REPOSITORY = 'WEBHOOK_DELIVERY_REPOSITORY';

@Module({
  controllers: [
    ConsentsController,
    CredentialsController,
    RequestsController,
    AuditController,
    WebhookDeliveriesController,
  ],
  providers: [
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
      provide: WEBHOOK_SUBSCRIPTION_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookSubscriptionRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: WEBHOOK_DELIVERY_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookDeliveryRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: PARTNER_REPOSITORY,
      useFactory: (db: DrizzleDB) => new PartnerRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: 'ROTATE_CREDENTIAL',
      useFactory: (repo: PartnerRepositoryPort) => {
        const config = getConfig();
        return new RotateIntegrationCredentialUseCase(
          repo,
          config.credentialEncryptionKey || undefined
        );
      },
      inject: [PARTNER_REPOSITORY],
    },
    {
      provide: WebhookDispatcher,
      useFactory: (
        subRepo: WebhookSubscriptionRepositoryPort,
        delRepo: WebhookDeliveryRepositoryPort,
        jobRepo: JobRepositoryPort
      ) => new AsyncWebhookDispatcher(subRepo, delRepo, jobRepo),
      inject: [
        WEBHOOK_SUBSCRIPTION_REPOSITORY,
        WEBHOOK_DELIVERY_REPOSITORY,
        JOB_REPOSITORY,
      ],
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
    InternalApiKeyGuard,
    {
      provide: RejectConsentUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) => new RejectConsentUseCase(repo, auditRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: 'GET_CONSENT_HISTORY',
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetConsentHistoryUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
  ],
})
export class InternalModule {}
