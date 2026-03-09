import { IsArray, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateIssuerDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  partnerId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
