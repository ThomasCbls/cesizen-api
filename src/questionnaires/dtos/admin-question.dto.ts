import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator'

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le texte de la question est obligatoire' })
  question: string

  @IsOptional()
  @IsInt({ message: "L'ordre doit être un nombre entier" })
  @Min(1, { message: "L'ordre doit être supérieur à 0" })
  order?: number
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Le texte de la question ne peut pas être vide' })
  question?: string

  @IsOptional()
  @IsInt({ message: "L'ordre doit être un nombre entier" })
  @Min(1, { message: "L'ordre doit être supérieur à 0" })
  order?: number
}
