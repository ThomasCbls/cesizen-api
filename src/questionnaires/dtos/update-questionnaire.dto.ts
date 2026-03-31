import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { QuestionnaireType } from '../enums/questionnaire-type.enum'

export class UpdateQuestionnaireDto {
  @IsString()
  @IsOptional()
  @Length(1, 255, { message: 'Le nom doit contenir entre 1 et 255 caractères' })
  nom?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(QuestionnaireType, {
    message: 'Le type doit être stress_diagnostic',
  })
  @IsOptional()
  type?: QuestionnaireType

  @IsUUID('4', { message: "L'ID du créateur doit être un UUID valide" })
  @IsOptional()
  createur_id?: string
}
