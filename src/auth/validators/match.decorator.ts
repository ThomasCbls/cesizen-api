import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

/**
 * Décorateur personnalisé pour vérifier que deux champs correspondent
 * Usage: @Match('other_field', { message: 'Les champs ne correspondent pas' })
 */
@ValidatorConstraint({ name: 'match', async: false })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints
    const relatedValue = args.object[relatedPropertyName]
    return value === relatedValue
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints
    return `${args.property} must match ${relatedPropertyName}`
  }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    })
  }
}
