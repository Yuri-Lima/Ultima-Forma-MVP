import { Body, Controller, Post } from '@nestjs/common';
import { CreateIssuerUseCase } from '@ultima-forma/application-partner';
import { CreateIssuerDto } from './create-issuer.dto';

@Controller('v1/issuers')
export class IssuersController {
  constructor(private readonly createIssuer: CreateIssuerUseCase) {}

  @Post()
  async create(@Body() dto: CreateIssuerDto) {
    const issuer = await this.createIssuer.execute({
      tenantId: dto.tenantId,
      partnerId: dto.partnerId,
      name: dto.name,
      scopes: dto.scopes,
    });
    return {
      id: issuer.id,
      partnerId: issuer.partnerId,
      tenantId: issuer.tenantId,
      name: issuer.name,
      status: issuer.status,
      scopes: issuer.scopes,
      createdAt: issuer.createdAt.toISOString(),
      updatedAt: issuer.updatedAt.toISOString(),
    };
  }
}
