import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApproveConsentUseCase,
  GetConsentDetailUseCase,
  GetConsentHistoryUseCase,
  RejectConsentUseCase,
  RevokeConsentUseCase,
} from '@ultima-forma/application-consent';
import type { ConsentStatus } from '@ultima-forma/domain-consent';
import { SkipPartnerAuth } from '../guards/skip-partner-auth.decorator';
import {
  REVOKE_CONSENT,
  GET_CONSENT_DETAIL,
  GET_CONSENT_HISTORY,
} from './v1.module';

@SkipPartnerAuth()
@Controller('v1/consents')
export class ConsentsController {
  constructor(
    private readonly approveConsent: ApproveConsentUseCase,
    private readonly rejectConsent: RejectConsentUseCase,
    @Inject(REVOKE_CONSENT)
    private readonly revokeConsentUseCase: RevokeConsentUseCase,
    @Inject(GET_CONSENT_DETAIL)
    private readonly getConsentDetailUseCase: GetConsentDetailUseCase,
    @Inject(GET_CONSENT_HISTORY)
    private readonly getConsentHistoryUseCase: GetConsentHistoryUseCase
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

  @Post(':id/revoke')
  async revoke(
    @Param('id') id: string,
    @Body() body: { reason?: string; revokedBy: string }
  ) {
    const revocation = await this.revokeConsentUseCase.execute({
      consentId: id,
      reason: body.reason,
      revokedBy: body.revokedBy,
    });
    return {
      id: revocation.id,
      consentId: revocation.consentId,
      reason: revocation.reason,
      revokedBy: revocation.revokedBy,
      createdAt: revocation.createdAt.toISOString(),
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const consent = await this.getConsentDetailUseCase.execute(id);
    return {
      id: consent.id,
      dataRequestId: consent.dataRequestId,
      status: consent.status,
      createdAt: consent.createdAt.toISOString(),
      updatedAt: consent.updatedAt.toISOString(),
    };
  }

  @Get('tenant/:tenantId')
  async history(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: ConsentStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const result = await this.getConsentHistoryUseCase.execute({
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
          updatedAt: item.consent.updatedAt.toISOString(),
        },
        dataRequest: {
          id: item.dataRequest.id,
          purpose: item.dataRequest.purpose,
          status: item.dataRequest.status,
          createdAt: item.dataRequest.createdAt.toISOString(),
        },
        claims: item.claims,
        consumerName: item.consumerName,
        revocation: item.revocation
          ? {
              id: item.revocation.id,
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
