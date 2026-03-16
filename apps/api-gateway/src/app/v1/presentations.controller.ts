import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreatePresentationSessionUseCase,
  CompletePresentationSessionUseCase,
} from '@ultima-forma/application-wallet';
import { PartnerSignatureGuard } from '../guards/partner-signature.guard';
import {
  CREATE_PRESENTATION_SESSION,
  COMPLETE_PRESENTATION_SESSION,
} from './tokens';

@UseGuards(PartnerSignatureGuard)
@Controller('v1/presentations')
export class PresentationsController {
  constructor(
    @Inject(CREATE_PRESENTATION_SESSION)
    private readonly createSession: CreatePresentationSessionUseCase,
    @Inject(COMPLETE_PRESENTATION_SESSION)
    private readonly completeSession: CompletePresentationSessionUseCase
  ) {}

  @Post()
  async create(
    @Body() body: { dataRequestId: string; userSubjectId: string }
  ) {
    const result = await this.createSession.execute(body);
    return {
      id: result.id,
      dataRequestId: result.dataRequestId,
      userSubjectId: result.userSubjectId,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
    };
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string) {
    const result = await this.completeSession.execute(id);
    return {
      id: result.id,
      status: result.status,
      completedAt: result.completedAt?.toISOString() ?? null,
    };
  }
}
