import { Module } from '@nestjs/common';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import {
  ApproveConsentUseCase,
  RejectConsentUseCase,
} from '@ultima-forma/application-consent';
import {
  DRIZZLE,
  type DrizzleDB,
  ConsentRepository,
} from '@ultima-forma/infrastructure-drizzle';
import { ConsentsController } from './consents.controller';

const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';

@Module({
  controllers: [ConsentsController],
  providers: [
    {
      provide: CONSENT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new ConsentRepository(db),
      inject: [DRIZZLE],
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
  ],
})
export class InternalModule {}
