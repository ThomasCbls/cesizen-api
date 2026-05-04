import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

export class SubmitStressDiagnosticAnswerDto {
  @IsUUID('4', { message: "L'ID de question doit être un UUID valide" })
  questionId: string

  @IsUUID('4', { message: "L'ID d'option doit être un UUID valide" })
  optionId: string

  @IsInt({ message: 'Le score doit être un entier' })
  @Min(0, { message: 'Le score doit être supérieur ou égal à 0' })
  @IsOptional()
  score?: number
}

export class SubmitStressDiagnosticDto {
  @IsArray({ message: 'Les réponses doivent être fournies sous forme de tableau' })
  @ArrayNotEmpty({ message: 'Au moins une réponse est requise' })
  @ValidateNested({ each: true })
  @Type(() => SubmitStressDiagnosticAnswerDto)
  answers: SubmitStressDiagnosticAnswerDto[]
}
