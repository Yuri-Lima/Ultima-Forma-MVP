import {
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const REQUEST_STATUSES = [
  'pending',
  'expired',
  'completed',
  'rejected',
] as const;

export class ListRequestsQueryDto {
  @IsOptional()
  @IsIn(REQUEST_STATUSES)
  status?: (typeof REQUEST_STATUSES)[number];

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
