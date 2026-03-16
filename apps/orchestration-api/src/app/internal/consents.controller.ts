import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApproveConsentUseCase,
  GetConsentHistoryUseCase,
  RejectConsentUseCase,
} from '@ultima-forma/application-consent';
import type { ConsentStatus } from '@ultima-forma/domain-consent';
import { InternalApiKeyGuard } from './internal-api-key.guard';

const GET_CONSENT_HISTORY = 'GET_CONSENT_HISTORY';

@Controller('internal/consents')
@UseGuards(InternalApiKeyGuard)
export class ConsentsController {
  constructor(
    private readonly approveConsent: ApproveConsentUseCase,
    private readonly rejectConsent: RejectConsentUseCase,
    @Inject(GET_CONSENT_HISTORY)
    private readonly getConsentHistory: GetConsentHistoryUseCase
  ) {}

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    const receipt = await this.approveConsent.execute(id);
    return {
      receiptId: receipt.id,
      approved: receipt.approved,
      createdAt: receipt.createdAt.toISOString(),
    };
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    const receipt = await this.rejectConsent.execute(id);
    return {
      receiptId: receipt.id,
      approved: receipt.approved,
      createdAt: receipt.createdAt.toISOString(),
    };
  }

  @Get()
  async list(
    @Query('tenantId') tenantId: string,
    @Query('status') status?: ConsentStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const result = await this.getConsentHistory.execute({
      tenantId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return {
      items: result.items.map((item) => ({
        consent: {
          id: item.consent.id,
          status: item.consent.status,
          createdAt: item.consent.createdAt.toISOString(),
        },
        dataRequest: {
          id: item.dataRequest.id,
          purpose: item.dataRequest.purpose,
          status: item.dataRequest.status,
        },
        claims: item.claims,
        consumerName: item.consumerName,
        revocation: item.revocation
          ? {
              reason: item.revocation.reason,
              revokedBy: item.revocation.revokedBy,
              createdAt: item.revocation.createdAt.toISOString(),
            }
          : undefined,
      })),
      total: result.total,
    };
  }
}
