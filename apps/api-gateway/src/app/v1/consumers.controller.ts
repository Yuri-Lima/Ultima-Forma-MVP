import { Body, Controller, Post } from '@nestjs/common';
import { CreateConsumerUseCase } from '@ultima-forma/application-partner';
import { CreateConsumerDto } from './create-consumer.dto';

@Controller('v1/consumers')
export class ConsumersController {
  constructor(private readonly createConsumer: CreateConsumerUseCase) {}

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
}
