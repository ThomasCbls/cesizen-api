import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsInt, Min, ValidateNested } from 'class-validator'

export class SubmitStressDiagnosticAnswerDto {
  @IsInt({ message: "L'ID de question doit être un entier" })
  @Min(1, { message: "L'ID de question doit être supérieur à 0" })
  question_id: number

  @IsInt({ message: "L'ID d'événement doit être un entier" })
  @Min(1, { message: "L'ID d'événement doit être supérieur à 0" })
  event_id: number
}

export class SubmitStressDiagnosticDto {
  @IsArray({ message: 'Les réponses doivent être fournies sous forme de tableau' })
  @ArrayNotEmpty({ message: 'Au moins une réponse est requise' })
  @ValidateNested({ each: true })
  @Type(() => SubmitStressDiagnosticAnswerDto)
  answers: SubmitStressDiagnosticAnswerDto[]
}
