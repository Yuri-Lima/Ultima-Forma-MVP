import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasAtLeastOneField', async: false })
export class HasAtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const obj = args.object as {
      name?: string;
      status?: string;
      scopes?: string[];
    };
    return (
      (obj.name !== undefined && obj.name !== null) ||
      (obj.status !== undefined && obj.status !== null) ||
      (obj.scopes !== undefined && obj.scopes !== null)
    );
  }

  defaultMessage(): string {
    return 'At least one of name, status, or scopes must be provided';
  }
}

/** Apply to a PATCH DTO class via a property - ensures at least one of name, status, scopes is set */
export function HasAtLeastOneField() {
  return Validate(HasAtLeastOneFieldConstraint);
}
