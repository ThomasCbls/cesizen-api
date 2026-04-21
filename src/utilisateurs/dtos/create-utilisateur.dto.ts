import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

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
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(255)
  mot_de_passe: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string
}
