import { Module } from '@nestjs/common';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
import { HealthModule } from '@ultima-forma/shared-health';
import { BullMqModule } from '@ultima-forma/infrastructure-queue';
import {
  WebhookProcessor,
  WebhookHttpDeliveryService,
  QueueEventsService,
  QUEUE_EVENTS_WEBHOOK_DELIVERY_REPOSITORY,
  QUEUE_EVENTS_AUDIT_REPOSITORY,
  WEBHOOK_DELIVERY_REPOSITORY,
  WEBHOOK_SUBSCRIPTION_REPOSITORY,
} from '@ultima-forma/infrastructure-queue';
import {
  WebhookDeliveryRepository,
  WebhookSubscriptionRepository,
  AuditRepository,
  DRIZZLE,
  type DrizzleDB,
} from '@ultima-forma/infrastructure-drizzle';
import { WorkerModule } from './worker.module';

@Module({
  imports: [
    DrizzleModule,
    HealthModule,
    BullMqModule.forRoot(),
    WorkerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
