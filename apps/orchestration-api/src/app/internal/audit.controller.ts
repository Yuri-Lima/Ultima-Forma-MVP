import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';
import { ListAuditEventsQueryDto } from './list-audit-events-query.dto';
import { InternalApiKeyGuard } from './internal-api-key.guard';

@Controller('internal/audit-events')
@UseGuards(InternalApiKeyGuard)
export class AuditController {
  constructor(
    @Inject('AUDIT_REPOSITORY') private readonly auditRepo: AuditRepositoryPort
  ) {}

  @Get()
  async list(@Query() query: ListAuditEventsQueryDto) {
    const filters =
      query.eventType || query.aggregateId
        ? {
            ...(query.eventType && { eventType: query.eventType }),
            ...(query.aggregateId && { aggregateId: query.aggregateId }),
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
      this.auditRepo.findMany(filters, pagination),
      this.auditRepo.count(filters),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        eventType: item.eventType,
        aggregateType: item.aggregateType,
        aggregateId: item.aggregateId,
        payload: item.payload,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }
}
