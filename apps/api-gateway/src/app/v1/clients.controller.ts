import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import type { IngestRepository } from '@ultima-forma/infrastructure-drizzle';
import { INGEST_REPOSITORY } from './tokens';

const ISSUER_SIMULATOR_URL =
  process.env['ISSUER_SIMULATOR_URL'] ?? 'http://localhost:4202';
const USER_APP_URL =
  process.env['USER_APP_URL'] ?? 'http://localhost:8081';

@Controller('v1/clients')
export class ClientsController {
  constructor(
    @Inject(INGEST_REPOSITORY)
    private readonly ingestRepo: IngestRepository
  ) {}

  @Post('register')
  async register(@Body() body: { cpf: string; phone: string }) {
    const tenantId = await this.ingestRepo.getDefaultTenantId();
    const client = await this.ingestRepo.registerClient(
      tenantId,
      body.cpf,
      body.phone
    );
    return {
      id: client.id,
      cpf: client.cpf,
      phone: client.phone,
      createdAt: client.createdAt.toISOString(),
    };
  }

  @Get(':id/discover')
  async discover(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.ingestRepo.findUserSubjectById(id);
    if (!user) return { issuers: [] };

    const cpf = user.externalSubjectRef;
    const results = await this.ingestRepo.discoverIssuersForCpf(cpf);
    return { issuers: results };
  }

  @Post(':id/request-data/:issuerId')
  async requestData(
    @Param('id', ParseUUIDPipe) userId: string,
    @Param('issuerId', ParseUUIDPipe) issuerId: string
  ) {
    const token = await this.ingestRepo.createDataRequestToken(
      userId,
      issuerId
    );
    const callbackUrl = `${USER_APP_URL}/auth/callback`;
    const redirectUrl = `${ISSUER_SIMULATOR_URL}/auth/login?requestToken=${token}&callbackUrl=${encodeURIComponent(callbackUrl)}&issuerId=${issuerId}&userId=${userId}`;
    return { redirectUrl, requestToken: token };
  }

  @Post(':id/wallet/receive')
  async walletReceive(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body()
    body: {
      requestToken: string;
      fields: { name: string; value: string }[];
    }
  ) {
    const tokenData = await this.ingestRepo.validateAndConsumeToken(
      body.requestToken
    );
    if (!tokenData) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const count = await this.ingestRepo.upsertWalletEntries(
      userId,
      tokenData.issuerId,
      body.fields
    );

    return { success: true, fieldsReceived: count };
  }

  @Get(':id/wallet')
  async getWallet(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query('issuerId') issuerId?: string
  ) {
    const entries = await this.ingestRepo.getWalletEntries(userId, issuerId);
    return { entries };
  }
}
