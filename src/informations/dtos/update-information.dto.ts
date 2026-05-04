import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsBoolean } from 'class-validator'

export class UpdateInformationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Le titre ne peut pas être vide' })
  @MaxLength(255, { message: 'Le titre ne peut pas dépasser 255 caractères' })
  titre?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Le contenu ne peut pas être vide' })
  contenu?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Le type de contenu ne peut pas être vide' })
  @MaxLength(100, { message: 'Le type de contenu ne peut pas dépasser 100 caractères' })
  type_contenu?: string

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
