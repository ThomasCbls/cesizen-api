import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator'
import { CreateEventDto } from './create-event.dto'
import { CreateQuestionDto } from './create-question.dto'

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @Length(1, 255, { message: 'Le nom doit contenir entre 1 et 255 caractères' })
  nom: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  type?: string

  @IsNumber()
  @IsNotEmpty({ message: "L'ID du créateur est obligatoire" })
  createur_id: number

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
