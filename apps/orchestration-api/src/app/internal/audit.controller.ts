import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';

@Controller('internal/audit-events')
export class AuditController {
  constructor(
    @Inject('AUDIT_REPOSITORY') private readonly auditRepo: AuditRepositoryPort
  ) {}

  @Get()
  async list(
    @Query('eventType') eventType?: string,
    @Query('aggregateId') aggregateId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters =
      eventType || aggregateId
        ? {
            ...(eventType && { eventType }),
            ...(aggregateId && { aggregateId }),
          }
        : undefined;
    const pagination =
      limit || offset
        ? {
            ...(limit && { limit: parseInt(limit, 10) }),
            ...(offset && { offset: parseInt(offset, 10) }),
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
