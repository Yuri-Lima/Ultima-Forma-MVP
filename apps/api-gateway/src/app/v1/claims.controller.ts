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
  AssignClaimPermissionUseCase,
  ListClaimDefinitionsUseCase,
  RegisterClaimDefinitionUseCase,
} from '@ultima-forma/application-claims';
import type {
  ClaimPermissionType,
  SensitivityLevel,
} from '@ultima-forma/domain-claims';
import { PartnerSignatureGuard } from '../guards/partner-signature.guard';
import { UseGuards } from '@nestjs/common';
import {
  REGISTER_CLAIM_DEFINITION,
  LIST_CLAIM_DEFINITIONS,
  ASSIGN_CLAIM_PERMISSION,
} from './tokens';

@UseGuards(PartnerSignatureGuard)
@Controller('v1/claims')
export class ClaimsController {
  constructor(
    @Inject(REGISTER_CLAIM_DEFINITION)
    private readonly registerClaim: RegisterClaimDefinitionUseCase,
    @Inject(LIST_CLAIM_DEFINITIONS)
    private readonly listClaims: ListClaimDefinitionsUseCase,
    @Inject(ASSIGN_CLAIM_PERMISSION)
    private readonly assignPermission: AssignClaimPermissionUseCase
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      key: string;
      namespace: string;
      displayName: string;
      description?: string;
      sensitivityLevel: SensitivityLevel;
      jsonSchema?: Record<string, unknown>;
    }
  ) {
    const result = await this.registerClaim.execute(body);
    return {
      id: result.id,
      key: result.key,
      namespace: result.namespace,
      displayName: result.displayName,
      sensitivityLevel: result.sensitivityLevel,
      createdAt: result.createdAt.toISOString(),
    };
  }

  @Get()
  async list(
    @Query('namespace') namespace?: string,
    @Query('sensitivityLevel') sensitivityLevel?: SensitivityLevel
  ) {
    const items = await this.listClaims.execute({
      namespace,
      sensitivityLevel,
    });
    return items.map((item) => ({
      id: item.id,
      key: item.key,
      namespace: item.namespace,
      displayName: item.displayName,
      description: item.description,
      sensitivityLevel: item.sensitivityLevel,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  @Post(':id/permissions')
  async addPermission(
    @Param('id') id: string,
    @Body() body: { partnerId: string; permissionType: ClaimPermissionType }
  ) {
    const result = await this.assignPermission.execute({
      claimDefinitionId: id,
      partnerId: body.partnerId,
      permissionType: body.permissionType,
    });
    return {
      id: result.id,
      partnerId: result.partnerId,
      claimDefinitionId: result.claimDefinitionId,
      permissionType: result.permissionType,
      createdAt: result.createdAt.toISOString(),
    };
  }
}
