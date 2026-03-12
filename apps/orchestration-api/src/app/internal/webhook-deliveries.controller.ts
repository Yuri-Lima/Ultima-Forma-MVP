import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import type { WebhookDeliveryRepositoryPort } from '@ultima-forma/domain-webhook';
import { ListWebhookDeliveriesQueryDto } from './list-webhook-deliveries-query.dto';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const WEBHOOK_DELIVERY_REPOSITORY = 'WEBHOOK_DELIVERY_REPOSITORY';

@Controller('internal/webhook-deliveries')
@UseGuards(InternalApiKeyGuard)
export class WebhookDeliveriesController {
  constructor(
    @Inject(WEBHOOK_DELIVERY_REPOSITORY)
    private readonly deliveryRepo: WebhookDeliveryRepositoryPort
  ) {}

  @Get()
  async list(@Query() query: ListWebhookDeliveriesQueryDto) {
    const filters =
      query.status || query.subscriptionId
        ? {
            ...(query.status && { status: query.status }),
            ...(query.subscriptionId && {
              subscriptionId: query.subscriptionId,
            }),
          }
        : undefined;
    const pagination =
      query.limit != null || query.offset != null
        ? {
            limit: query.limit ?? 50,
            offset: query.offset ?? 0,
          }
        : undefined;

    const [items, total] = await Promise.all([
      this.deliveryRepo.findMany(filters, pagination),
      this.deliveryRepo.count(filters),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        subscriptionId: item.subscriptionId,
        eventType: item.eventType,
        payload: item.payload,
        status: item.status,
        attempts: item.attempts,
        lastError: item.lastError,
        nextRetryAt: item.nextRetryAt?.toISOString() ?? null,
        succeededAt: item.succeededAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }
}
