import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsBoolean } from 'class-validator'

export class CreateInformationDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MaxLength(255, { message: 'Le titre ne peut pas dépasser 255 caractères' })
  titre: string

  @IsString()
  @IsNotEmpty({ message: 'Le contenu est obligatoire' })
  contenu: string

  @IsString()
  @IsNotEmpty({ message: 'Le type de contenu est obligatoire' })
  @MaxLength(100, { message: 'Le type de contenu ne peut pas dépasser 100 caractères' })
  type_contenu: string

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Le slug ne peut pas dépasser 255 caractères' })
  slug?: string

  @IsOptional()
  @IsBoolean()
  est_actif?: boolean

  @IsOptional()
  @IsInt()
  ordre_affichage?: number
}
