import { UtilisateurResponseDto } from '../../utilisateurs/dtos/utilisateur-response.dto'

export class EventResponseDto {
  id_Event: number
  event: string
  points: number
}

export class QuestionResponseDto {
  id_Question: number
  question: string
  order?: number
}

export class QuestionnaireResponseDto {
  id_Questionnaire: number
  nom: string
  description?: string
  type: string
  date_creation: Date
  createur: UtilisateurResponseDto
  events: EventResponseDto[]
  questions: QuestionResponseDto[]
}
