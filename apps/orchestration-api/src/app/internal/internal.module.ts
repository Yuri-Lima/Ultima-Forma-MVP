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
} from '@ultima-forma/infrastructure-drizzle';
import { ConsentsController } from './consents.controller';
import { RequestsController } from './requests.controller';
import { AuditController } from './audit.controller';

const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';
const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';
const BILLABLE_EVENT_REPOSITORY = 'BILLABLE_EVENT_REPOSITORY';

@Module({
  controllers: [ConsentsController, RequestsController, AuditController],
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
  ],
})
export class InternalModule {}
