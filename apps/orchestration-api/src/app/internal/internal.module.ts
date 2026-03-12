import { Module } from '@nestjs/common';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import type {
  AuditRepositoryPort,
  BillableEventRepositoryPort,
} from '@ultima-forma/domain-audit';
import {
  ApproveConsentUseCase,
  RejectConsentUseCase,
} from '@ultima-forma/application-consent';
import {
  DRIZZLE,
  type DrizzleDB,
  ConsentRepository,
  AuditRepository,
  BillableEventRepository,
  WebhookSubscriptionRepository,
  WebhookDeliveryRepository,
  WebhookDispatcher,
} from '@ultima-forma/infrastructure-drizzle';
import { ConsentsController } from './consents.controller';
import { RequestsController } from './requests.controller';
import { AuditController } from './audit.controller';
import { WebhookDeliveriesController } from './webhook-deliveries.controller';
import { WebhookRetryJob } from './webhook-retry.job';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';
const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';
const BILLABLE_EVENT_REPOSITORY = 'BILLABLE_EVENT_REPOSITORY';
const WEBHOOK_SUBSCRIPTION_REPOSITORY = 'WEBHOOK_SUBSCRIPTION_REPOSITORY';
const WEBHOOK_DELIVERY_REPOSITORY = 'WEBHOOK_DELIVERY_REPOSITORY';

@Module({
  controllers: [
    ConsentsController,
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
      provide: WebhookDispatcher,
      useFactory: (subRepo: unknown, delRepo: unknown) =>
        new WebhookDispatcher(
          subRepo as WebhookSubscriptionRepository,
          delRepo as WebhookDeliveryRepository
        ),
      inject: [WEBHOOK_SUBSCRIPTION_REPOSITORY, WEBHOOK_DELIVERY_REPOSITORY],
    },
    WebhookRetryJob,
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
  ],
})
export class InternalModule {}
