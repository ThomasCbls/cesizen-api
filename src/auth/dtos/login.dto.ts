import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

/**
 * DTO pour la connexion (login)
 * Le mot de passe est accepté tel quel en login pour compatibilité
 * Les nouvelles validations ANSII s'appliquent à la création
 */
export class LoginDto {
  @IsEmail({}, { message: "L'email doit être valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(1, { message: 'Le mot de passe est requis' })
  password: string
}
