import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { HasAtLeastOneField } from './has-at-least-one-field.validator';

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

  @HasAtLeastOneField()
  get _requireAtLeastOne(): this {
    return this;
  }
}
