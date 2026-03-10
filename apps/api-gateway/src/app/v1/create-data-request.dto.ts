import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateDataRequestDto {
  @IsUUID()
  consumerId!: string;

  @IsUUID()
  tenantId!: string;

  @IsString()
  @MinLength(1)
  purpose!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  claims!: string[];

  @IsDateString()
  expiresAt!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
