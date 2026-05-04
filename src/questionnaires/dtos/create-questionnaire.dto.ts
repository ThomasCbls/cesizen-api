import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator'
import { CreateQuestionDto } from './create-question.dto'

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @Length(1, 255, { message: 'Le titre doit contenir entre 1 et 255 caractères' })
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsUUID('4', { message: "L'ID du créateur doit être un UUID valide" })
  @IsOptional()
  createur_id?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[]
}
