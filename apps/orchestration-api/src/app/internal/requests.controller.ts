import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { ConsentRepositoryPort, RequestStatus } from '@ultima-forma/domain-consent';

@Controller('internal/requests')
export class RequestsController {
  constructor(
    @Inject('CONSENT_REPOSITORY') private readonly consentRepo: ConsentRepositoryPort
  ) {}

  @Get()
  async list(
    @Query('status') status?: RequestStatus,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters =
      status || tenantId
        ? {
            ...(status && { status }),
            ...(tenantId && { tenantId }),
          }
        : undefined;
    const pagination =
      limit || offset
        ? {
            ...(limit && { limit: parseInt(limit, 10) }),
            ...(offset && { offset: parseInt(offset, 10) }),
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
