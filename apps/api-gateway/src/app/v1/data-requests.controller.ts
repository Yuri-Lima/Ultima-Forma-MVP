import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import {
  CreateDataRequestUseCase,
  ExpireRequestUseCase,
  GetDataRequestForUserUseCase,
  GetDataRequestResultForConsumerUseCase,
} from '@ultima-forma/application-consent';
import { CreateDataRequestDto } from './create-data-request.dto';

@Controller('v1/data-requests')
export class DataRequestsController {
  constructor(
    private readonly createDataRequest: CreateDataRequestUseCase,
    private readonly getDataRequestForUser: GetDataRequestForUserUseCase,
    private readonly getDataRequestResultForConsumer: GetDataRequestResultForConsumerUseCase,
    private readonly expireRequest: ExpireRequestUseCase
  ) {}

  @Post()
  async create(
    @Body() dto: CreateDataRequestDto,
    @Headers('Idempotency-Key') idempotencyKey?: string
  ) {
    const key = dto.idempotencyKey ?? idempotencyKey;
    const request = await this.createDataRequest.execute({
      consumerId: dto.consumerId,
      tenantId: dto.tenantId,
      purpose: dto.purpose,
      claims: dto.claims,
      expiresAt: new Date(dto.expiresAt),
      idempotencyKey: key,
    });

    const userAppBase = process.env['USER_APP_URL'] ?? 'http://localhost:8081';
    const consentUrl = `${userAppBase}/consent/${request.id}`;

    return {
      id: request.id,
      consumerId: request.consumerId,
      tenantId: request.tenantId,
      status: request.status,
      purpose: request.purpose,
      expiresAt: request.expiresAt.toISOString(),
      consentUrl,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }

  @Get(':id/result')
  async getResultForConsumer(@Param('id') id: string) {
    const result = await this.getDataRequestResultForConsumer.execute(id);
    return {
      requestId: result.requestId,
      status: result.status,
      consumerId: result.consumerId,
      consumerName: result.consumerName,
      purpose: result.purpose,
      claims: result.claims,
      expiresAt: result.expiresAt.toISOString(),
      createdAt: result.createdAt.toISOString(),
      ...(result.receipt && {
        receipt: {
          id: result.receipt.id,
          approved: result.receipt.approved,
          trustLevel: result.receipt.trustLevel,
          ...(result.receipt.verificationResult && {
            verificationResult: {
              trustLevel: result.receipt.verificationResult.trustLevel,
              verifiedAt:
                result.receipt.verificationResult.verifiedAt instanceof Date
                  ? result.receipt.verificationResult.verifiedAt.toISOString()
                  : result.receipt.verificationResult.verifiedAt,
              verifiedClaims:
                result.receipt.verificationResult.verifiedClaims,
            },
          }),
        },
      }),
    };
  }

  @Get(':id')
  async getForUser(@Param('id') id: string) {
    const result = await this.getDataRequestForUser.execute(id);
    return {
      request: {
        id: result.request.id,
        status: result.request.status,
        purpose: result.request.purpose,
        expiresAt: result.request.expiresAt.toISOString(),
      },
      consumerName: result.consumerName,
      items: result.items.map((i) => ({ id: i.id, claim: i.claim })),
      consentId: result.consent.id,
    };
  }

  @Post(':id/expire')
  async expire(@Param('id') id: string) {
    const request = await this.expireRequest.execute(id);
    return {
      id: request.id,
      status: request.status,
      updatedAt: request.updatedAt.toISOString(),
    };
  }
}
