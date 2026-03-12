import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  CreateConsumerUseCase,
  UpdateConsumerUseCase,
} from '@ultima-forma/application-partner';
import { CreateConsumerDto } from './create-consumer.dto';
import { UpdateConsumerDto } from './update-consumer.dto';

@Controller('v1/consumers')
export class ConsumersController {
  constructor(
    private readonly createConsumer: CreateConsumerUseCase,
    private readonly updateConsumer: UpdateConsumerUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateConsumerDto) {
    const consumer = await this.createConsumer.execute({
      tenantId: dto.tenantId,
      partnerId: dto.partnerId,
      name: dto.name,
      scopes: dto.scopes,
    });
    return {
      id: consumer.id,
      partnerId: consumer.partnerId,
      tenantId: consumer.tenantId,
      name: consumer.name,
      status: consumer.status,
      scopes: consumer.scopes,
      createdAt: consumer.createdAt.toISOString(),
      updatedAt: consumer.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateConsumerDto) {
    const input: { name?: string; status?: string; scopes?: string[] } = {};
    if (dto.name !== undefined) input.name = dto.name;
    if (dto.status !== undefined) input.status = dto.status;
    if (dto.scopes !== undefined) input.scopes = dto.scopes;

    const consumer = await this.updateConsumer.execute(id, input);
    return {
      id: consumer.id,
      partnerId: consumer.partnerId,
      tenantId: consumer.tenantId,
      name: consumer.name,
      status: consumer.status,
      scopes: consumer.scopes,
      createdAt: consumer.createdAt.toISOString(),
      updatedAt: consumer.updatedAt.toISOString(),
    };
  }
}
