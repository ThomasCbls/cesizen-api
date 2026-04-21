import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty({ message: "Le texte de l'option est obligatoire" })
  text: string

  @IsNumber()
  @Min(0, { message: 'Le score doit être supérieur ou égal à 0' })
  score: number
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le texte de la question est obligatoire' })
  text: string

  @IsNumber()
  @IsOptional()
  @Min(1, { message: "L'ordre doit être supérieur ou égal à 1" })
  order?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[]
}
