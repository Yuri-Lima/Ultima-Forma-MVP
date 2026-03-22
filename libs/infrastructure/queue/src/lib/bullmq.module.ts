import { DynamicModule, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  QUEUE_WEBHOOKS,
  QUEUE_NOTIFICATIONS,
  QUEUE_AUDIT_PROJECTIONS,
} from '@ultima-forma/domain-jobs';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';
import { getRedisConnectionConfig, getQueuePrefix } from './queue.config';
import { BullMqJobRepository } from './bullmq-job.repository';

export const JOB_REPOSITORY = 'JOB_REPOSITORY';

@Global()
@Module({})
export class BullMqModule {
  static forRoot(): DynamicModule {
    const connection = getRedisConnectionConfig();
    const prefix = getQueuePrefix();

    return {
      module: BullMqModule,
      imports: [
        BullModule.forRoot({
          connection,
          prefix,
        }),
        BullModule.registerQueue(
          { name: QUEUE_WEBHOOKS },
          { name: QUEUE_NOTIFICATIONS },
          { name: QUEUE_AUDIT_PROJECTIONS }
        ),
      ],
      providers: [
        BullMqJobRepository,
        {
          provide: JOB_REPOSITORY,
          useExisting: BullMqJobRepository,
        },
      ],
      exports: [BullModule, JOB_REPOSITORY, BullMqJobRepository],
    };
  }
}
