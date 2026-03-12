import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateConsumerDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'revoked'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
