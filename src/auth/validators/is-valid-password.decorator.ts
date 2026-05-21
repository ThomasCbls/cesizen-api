import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { PasswordValidatorService } from './password-validator.service'

/**
 * Contrainte de validation personnalisée pour @IsValidPassword()
 * Utilise l'injection de dépendances NestJS
 */
@ValidatorConstraint({ name: 'isValidPassword', async: false })
@Injectable()
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  constructor(private passwordValidatorService: PasswordValidatorService) {}

  validate(password: any): boolean {
    if (typeof password !== 'string') {
      return false
    }
    const result = this.passwordValidatorService.validatePassword(password)
    return result.isValid
  }

  defaultMessage(args: ValidationArguments): string {
    const password = args.value
    if (typeof password !== 'string') {
      return 'Le mot de passe doit être une chaîne de caractères'
    }
    const result = this.passwordValidatorService.validatePassword(password)
    if (result.errors.length > 0) {
      return result.errors[0]
    }
    return 'Mot de passe invalide'
  }
}

/**
 * Décorateur personnalisé @IsValidPassword() pour valider les mots de passe
 * selon les recommandations ANSII
 *
 * Usage: @IsValidPassword()
 */
export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    })
  }
}
