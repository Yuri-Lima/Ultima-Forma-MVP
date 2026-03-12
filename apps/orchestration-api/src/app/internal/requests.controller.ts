import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import { ListRequestsQueryDto } from './list-requests-query.dto';
import { InternalApiKeyGuard } from './internal-api-key.guard';

@Controller('internal/requests')
@UseGuards(InternalApiKeyGuard)
export class RequestsController {
  constructor(
    @Inject('CONSENT_REPOSITORY') private readonly consentRepo: ConsentRepositoryPort
  ) {}

  @Get()
  async list(@Query() query: ListRequestsQueryDto) {
    const filters =
      query.status || query.tenantId
        ? {
            ...(query.status && { status: query.status }),
            ...(query.tenantId && { tenantId: query.tenantId }),
          }
        : undefined;
    const pagination =
      query.limit != null || query.offset != null
        ? {
            limit: query.limit ?? 50,
            offset: query.offset ?? 0,
          }
        : undefined;

    const result = await this.consentRepo.listDataRequests(filters, pagination);

    return {
      items: result.items.map((item) => ({
        id: item.id,
        consumerId: item.consumerId,
        consumerName: item.consumerName,
        tenantId: item.tenantId,
        status: item.status,
        purpose: item.purpose,
        expiresAt: item.expiresAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
      total: result.total,
    };
  }
}
