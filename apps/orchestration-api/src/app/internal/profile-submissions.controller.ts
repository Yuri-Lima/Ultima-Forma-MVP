import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import type { IngestRepository } from '@ultima-forma/infrastructure-drizzle';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const INGEST_REPOSITORY = 'INGEST_REPOSITORY';

@Controller('internal/profile-submissions')
@UseGuards(InternalApiKeyGuard)
export class ProfileSubmissionsController {
  constructor(
    @Inject(INGEST_REPOSITORY)
    private readonly ingestRepo: IngestRepository
  ) {}

  @Get()
  async list(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('since') since?: string
  ) {
    const result = await this.ingestRepo.findSubmissions({
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      since,
    });

    return {
      items: result.items.map((item) => ({
        id: item.id,
        issuerId: item.issuerId,
        issuerName: item.issuerName,
        partnerName: item.partnerName,
        cpf: item.cpf,
        phone: item.phone,
        extraFields: item.extraFields,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
      })),
      total: result.total,
    };
  }
}
