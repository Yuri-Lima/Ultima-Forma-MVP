import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  CreateIssuerUseCase,
  UpdateIssuerUseCase,
} from '@ultima-forma/application-partner';
import { CreateIssuerDto } from './create-issuer.dto';
import { UpdateIssuerDto } from './update-issuer.dto';

@Controller('v1/issuers')
export class IssuersController {
  constructor(
    private readonly createIssuer: CreateIssuerUseCase,
    private readonly updateIssuer: UpdateIssuerUseCase
  ) {}

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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateIssuerDto) {
    const input: { name?: string; status?: string; scopes?: string[] } = {};
    if (dto.name !== undefined) input.name = dto.name;
    if (dto.status !== undefined) input.status = dto.status;
    if (dto.scopes !== undefined) input.scopes = dto.scopes;

    const issuer = await this.updateIssuer.execute(id, input);
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
