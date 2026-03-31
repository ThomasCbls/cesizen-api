import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'
import { QuestionnaireType } from '../../questionnaires/enums/questionnaire-type.enum'
import { Event } from '../../questionnaires/entities/event.entity'
import { Question } from '../../questionnaires/entities/question.entity'
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity'
import { StressDiagnosticHistoryQueryDto } from '../dtos/stress-diagnostic-history-query.dto'
import {
  SubmitStressDiagnosticAnswerDto,
  SubmitStressDiagnosticDto,
} from '../dtos/submit-stress-diagnostic.dto'
import {
  StressDiagnosticAnswerResponseDto,
  StressDiagnosticResponseDto,
} from '../dtos/stress-diagnostic-response.dto'
import { StressLevel } from '../enums/stress-level.enum'
import { StressDiagnosticRepository } from '../repositories/stress-diagnostic.repository'
import { StressDiagnosticResult } from '../entities/stress-diagnostic-result.entity'

type MappedStressAnswer = {
  question: Question
  question_id: number
  event: Event
  event_id: number
  points_obtenus: number
  question_label: string
  event_label: string
}

@Injectable()
export class StressDiagnosticService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    private readonly stressDiagnosticRepository: StressDiagnosticRepository,
  ) {}

  async submitDiagnostic(
    questionnaireId: number,
    submitDto: SubmitStressDiagnosticDto,
    currentUser: AuthenticatedUser,
  ): Promise<StressDiagnosticResponseDto> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id_Questionnaire: questionnaireId },
      relations: ['createur', 'events', 'questions'],
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${questionnaireId} non trouvé`)
    }

    this.validateQuestionnaire(questionnaire)
    const mappedAnswers = this.mapAndValidateAnswers(questionnaire, submitDto.answers)
    const scoreTotal = mappedAnswers.reduce((total, answer) => total + answer.points_obtenus, 0)
    const scoreMaximum =
      questionnaire.questions.length * this.getMaximumEventPoints(questionnaire.events)
    const interpretation = this.interpretScore(scoreTotal, scoreMaximum)

    const diagnostic = await this.stressDiagnosticRepository.createAndSave({
      questionnaire,
      questionnaire_id: questionnaire.id_Questionnaire,
      utilisateur_id: currentUser.sub,
      score_total: scoreTotal,
      score_maximum: scoreMaximum,
      niveau_stress: interpretation.level,
      interpretation: interpretation.message,
      answers: mappedAnswers,
    })

    return this.mapToResponse(diagnostic)
  }

  async getHistory(
    currentUser: AuthenticatedUser,
    query: StressDiagnosticHistoryQueryDto,
  ): Promise<StressDiagnosticResponseDto[]> {
    const targetUserId = query.utilisateurId || currentUser.sub

    if (targetUserId !== currentUser.sub && currentUser.role !== 'admin') {
      throw new ForbiddenException('Vous ne pouvez consulter que votre propre historique')
    }

    const diagnostics = await this.stressDiagnosticRepository.findByUtilisateurId(targetUserId)
    return diagnostics.map((diagnostic) => this.mapToResponse(diagnostic))
  }

  async getDiagnosticById(
    diagnosticId: number,
    currentUser: AuthenticatedUser,
  ): Promise<StressDiagnosticResponseDto> {
    const diagnostic = await this.stressDiagnosticRepository.findById(diagnosticId)

    if (!diagnostic) {
      throw new NotFoundException(`Diagnostic avec l'ID ${diagnosticId} non trouvé`)
    }

    if (diagnostic.utilisateur_id !== currentUser.sub && currentUser.role !== 'admin') {
      throw new ForbiddenException('Vous ne pouvez consulter que vos propres diagnostics')
    }

    return this.mapToResponse(diagnostic)
  }

  private validateQuestionnaire(questionnaire: Questionnaire): void {
    if (questionnaire.type !== QuestionnaireType.STRESS_DIAGNOSTIC) {
      throw new BadRequestException('Ce questionnaire ne correspond pas à un diagnostic de stress')
    }

    if (!questionnaire.questions || questionnaire.questions.length === 0) {
      throw new BadRequestException('Le questionnaire ne contient aucune question')
    }

    if (!questionnaire.events || questionnaire.events.length < 2) {
      throw new BadRequestException('Le questionnaire ne contient pas assez de niveaux de réponse')
    }
  }

  private mapAndValidateAnswers(
    questionnaire: Questionnaire,
    answers: SubmitStressDiagnosticAnswerDto[],
  ): MappedStressAnswer[] {
    if (answers.length !== questionnaire.questions.length) {
      throw new BadRequestException('Toutes les questions doivent recevoir exactement une réponse')
    }

    const answeredQuestionIds = new Set<number>()
    const questionnaireQuestions = new Map<number, Question>(
      questionnaire.questions.map((question) => [question.id_Question, question]),
    )
    const questionnaireEvents = new Map<number, Event>(
      questionnaire.events.map((event) => [event.id_Event, event]),
    )

    return answers.map((answer) => {
      if (answeredQuestionIds.has(answer.question_id)) {
        throw new BadRequestException('Chaque question ne peut être répondue qu’une seule fois')
      }

      const question = questionnaireQuestions.get(answer.question_id)
      if (!question) {
        throw new BadRequestException(
          `La question ${answer.question_id} n'appartient pas au questionnaire`,
        )
      }

      const event = questionnaireEvents.get(answer.event_id)
      if (!event) {
        throw new BadRequestException(
          `L'événement ${answer.event_id} n'appartient pas au questionnaire`,
        )
      }

      answeredQuestionIds.add(answer.question_id)

      return {
        question,
        question_id: question.id_Question,
        event,
        event_id: event.id_Event,
        points_obtenus: event.points,
        question_label: question.question,
        event_label: event.event,
      }
    })
  }

  private getMaximumEventPoints(events: Event[]): number {
    return events.reduce((max, event) => Math.max(max, event.points), 0)
  }

  private interpretScore(
    scoreTotal: number,
    scoreMaximum: number,
  ): { level: StressLevel; message: string } {
    if (scoreMaximum <= 0) {
      throw new BadRequestException('Le score maximum du questionnaire doit être supérieur à 0')
    }

    const percentage = (scoreTotal / scoreMaximum) * 100

    if (percentage <= 33) {
      return {
        level: StressLevel.LOW,
        message: 'Niveau de stress faible. Les signaux actuels restent globalement maîtrisés.',
      }
    }

    if (percentage <= 66) {
      return {
        level: StressLevel.MODERATE,
        message:
          'Niveau de stress modéré. Une vigilance et des actions préventives sont recommandées.',
      }
    }

    return {
      level: StressLevel.HIGH,
      message:
        'Niveau de stress élevé. Un accompagnement rapide ou des mesures correctives sont conseillés.',
    }
  }

  private mapToResponse(diagnostic: StressDiagnosticResult): StressDiagnosticResponseDto {
    return {
      id_diagnostic: diagnostic.id_diagnostic,
      questionnaire_id: diagnostic.questionnaire_id,
      questionnaire_nom: diagnostic.questionnaire.nom,
      utilisateur_id: diagnostic.utilisateur_id,
      score_total: diagnostic.score_total,
      score_maximum: diagnostic.score_maximum,
      niveau_stress: diagnostic.niveau_stress,
      interpretation: diagnostic.interpretation,
      date_soumission: diagnostic.date_soumission,
      answers: (diagnostic.answers || []).map(
        (answer): StressDiagnosticAnswerResponseDto => ({
          id_reponse: answer.id_reponse,
          question_id: answer.question_id,
          question: answer.question_label,
          event_id: answer.event_id,
          event: answer.event_label,
          points_obtenus: answer.points_obtenus,
        }),
      ),
    }
  }
}
