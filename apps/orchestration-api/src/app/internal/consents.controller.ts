import { Controller, Param, Post } from '@nestjs/common';
import {
  ApproveConsentUseCase,
  RejectConsentUseCase,
} from '@ultima-forma/application-consent';

@Controller('internal/consents')
export class ConsentsController {
  constructor(
    private readonly approveConsent: ApproveConsentUseCase,
    private readonly rejectConsent: RejectConsentUseCase
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
}
