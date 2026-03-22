import { Module } from '@nestjs/common';
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

@Module({
  imports: [],
  providers: [
    WebhookHttpDeliveryService,
    {
      provide: WEBHOOK_DELIVERY_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookDeliveryRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: WEBHOOK_SUBSCRIPTION_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookSubscriptionRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: QUEUE_EVENTS_WEBHOOK_DELIVERY_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookDeliveryRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: QUEUE_EVENTS_AUDIT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new AuditRepository(db),
      inject: [DRIZZLE],
    },
    WebhookProcessor,
    QueueEventsService,
  ],
  exports: [],
})
export class WorkerModule {}
