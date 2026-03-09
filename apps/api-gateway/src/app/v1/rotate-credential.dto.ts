import { IsUUID } from 'class-validator';

export class RotateCredentialDto {
  @IsUUID()
  partnerId!: string;
}
