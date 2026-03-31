import { StressLevel } from '../enums/stress-level.enum'

export class StressDiagnosticAnswerResponseDto {
  id_reponse: number
  question_id: number
  question: string
  event_id: number
  event: string
  points_obtenus: number
}

export class StressDiagnosticResponseDto {
  id_diagnostic: number
  questionnaire_id: number
  questionnaire_nom: string
  utilisateur_id: string
  score_total: number
  score_maximum: number
  niveau_stress: StressLevel
  interpretation: string
  date_soumission: Date
  answers: StressDiagnosticAnswerResponseDto[]
}
