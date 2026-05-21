import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'
import { IsValidPassword } from '../../auth/validators/is-valid-password.decorator'

/**
 * DTO pour la mise à jour d'un utilisateur
 * Conforme aux recommandations ANSII pour la sécurité des mots de passe
 */
export class UpdateUtilisateurDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string

  @IsOptional()
  @IsEmail({}, { message: "L'email doit être valide" })
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsValidPassword()
  mot_de_passe?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string

  @IsOptional()
  @IsBoolean()
  est_actif?: boolean
}
