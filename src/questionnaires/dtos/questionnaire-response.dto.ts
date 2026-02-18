import { UtilisateurResponseDto } from '../../utilisateurs/dtos/utilisateur-response.dto'

export class QuestionnaireResponseDto {
  id_Questionnaire: number
  nom: string
  description?: string
  date_creation: Date
  createur: UtilisateurResponseDto
}
