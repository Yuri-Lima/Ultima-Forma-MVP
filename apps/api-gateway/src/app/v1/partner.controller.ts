import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  GetPartnerDashboardUseCase,
  ListPartnerRequestsUseCase,
  ManagePartnerWebhooksUseCase,
  RotateIntegrationCredentialUseCase,
} from '@ultima-forma/application-partner';
import type { PartnerDashboardRepositoryPort } from '@ultima-forma/domain-partner';
import { PartnerSignatureGuard } from '../guards/partner-signature.guard';
import {
  GET_PARTNER_DASHBOARD,
  LIST_PARTNER_REQUESTS,
  MANAGE_PARTNER_WEBHOOKS,
  PARTNER_DASHBOARD_REPOSITORY,
} from './tokens';

@UseGuards(PartnerSignatureGuard)
@Controller('v1/partner')
export class PartnerController {
  constructor(
    @Inject(GET_PARTNER_DASHBOARD)
    private readonly getDashboard: GetPartnerDashboardUseCase,
    @Inject(LIST_PARTNER_REQUESTS)
    private readonly listRequests: ListPartnerRequestsUseCase,
    @Inject(MANAGE_PARTNER_WEBHOOKS)
    private readonly manageWebhooks: ManagePartnerWebhooksUseCase,
    @Inject(PARTNER_DASHBOARD_REPOSITORY)
    private readonly dashboardRepo: PartnerDashboardRepositoryPort,
    private readonly rotateCredential: RotateIntegrationCredentialUseCase
  ) {}

  @Get('dashboard')
  async dashboard(@Query('partnerId') partnerId: string) {
    return this.getDashboard.execute(partnerId);
  }

  @Get('requests')
  async requests(
    @Query('partnerId') partnerId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.listRequests.execute({
      partnerId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('credentials')
  async credentials(@Query('partnerId') partnerId: string) {
    const items = await this.dashboardRepo.listPartnerCredentials(partnerId);
    return items.map((c) => ({
      id: c.id,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      expiresAt: c.expiresAt?.toISOString() ?? null,
    }));
  }

  @Post('credentials/rotate')
  async rotate(@Body() body: { partnerId: string }) {
    return this.rotateCredential.execute(body.partnerId);
  }

  @Get('webhooks')
  async webhooksList(@Query('partnerId') partnerId: string) {
    return this.manageWebhooks.list(partnerId);
  }

  @Post('webhooks')
  async webhooksCreate(
    @Body()
    body: {
      partnerId: string;
      url: string;
      eventTypes: string[];
      secret?: string;
    }
  ) {
    return this.manageWebhooks.create(body);
  }

  @Patch('webhooks/:id')
  async webhooksUpdate(
    @Param('id') id: string,
    @Body()
    body: {
      url?: string;
      eventTypes?: string[];
      status?: string;
    }
  ) {
    return this.manageWebhooks.update(id, body);
  }
}
