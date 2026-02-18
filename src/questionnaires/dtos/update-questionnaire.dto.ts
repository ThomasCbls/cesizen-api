import { IsNumber, IsOptional, IsString, Length } from 'class-validator'

export class UpdateQuestionnaireDto {
  @IsString()
  @IsOptional()
  @Length(1, 255, { message: 'Le nom doit contenir entre 1 et 255 caractères' })
  nom?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsOptional()
  createur_id?: number
}
