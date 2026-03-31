import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator'
import { CreateEventDto } from './create-event.dto'
import { CreateQuestionDto } from './create-question.dto'
import { QuestionnaireType } from '../enums/questionnaire-type.enum'

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @Length(1, 255, { message: 'Le nom doit contenir entre 1 et 255 caractères' })
  nom: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(QuestionnaireType, {
    message: 'Le type doit être stress_diagnostic',
  })
  @IsOptional()
  type?: QuestionnaireType

  @IsUUID('4', { message: "L'ID du créateur doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID du créateur est obligatoire" })
  createur_id: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  @IsOptional()
  events?: CreateEventDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[]
}
