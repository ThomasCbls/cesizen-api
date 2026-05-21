import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { IsValidPassword } from '../../auth/validators/is-valid-password.decorator'
import { Match } from '../../auth/validators/match.decorator'

/**
 * DTO pour le changement de mot de passe
 * Conforme aux recommandations ANSII
 */
export class ChangePasswordDto {
  @IsNotEmpty({ message: "L'ancien mot de passe est requis" })
  @IsString()
  oldPassword: string

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString()
  @MaxLength(255)
  @IsValidPassword()
  newPassword: string

  @IsNotEmpty({ message: 'La confirmation du mot de passe est requise' })
  @IsString()
  @Match('newPassword', { message: 'Les deux mots de passe ne correspondent pas' })
  confirmPassword: string
}
