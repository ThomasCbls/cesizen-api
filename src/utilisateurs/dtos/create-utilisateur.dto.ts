import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { IsValidPassword } from '../../auth/validators/is-valid-password.decorator'

/**
 * DTO pour la création d'un utilisateur
 * Conforme aux recommandations ANSII pour la sécurité des mots de passe
 */
export class CreateUtilisateurDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(100)
  nom: string

  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString()
  @MaxLength(100)
  prenom: string

  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  @MaxLength(255)
  @IsValidPassword()
  mot_de_passe: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string
}
