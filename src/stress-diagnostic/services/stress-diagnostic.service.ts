import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity'
import { StressDiagnosticHistoryQueryDto } from '../dtos/stress-diagnostic-history-query.dto'
import {
  StressDiagnosticHistoryItemDto,
  StressDiagnosticHistoryResponseDto,
  StressDiagnosticSubmitResponseDto,
} from '../dtos/stress-diagnostic-response.dto'
import {
  SubmitStressDiagnosticAnswerDto,
  SubmitStressDiagnosticDto,
} from '../dtos/submit-stress-diagnostic.dto'
import { StressDiagnosticResult } from '../entities/stress-diagnostic-result.entity'
import { StressDiagnosticRepository } from '../repositories/stress-diagnostic.repository'

@Injectable()
export class StressDiagnosticService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    private readonly stressDiagnosticRepository: StressDiagnosticRepository,
  ) {}

  async submitDiagnostic(
    questionnaireId: string,
    submitDto: SubmitStressDiagnosticDto,
    currentUser: AuthenticatedUser,
  ): Promise<StressDiagnosticSubmitResponseDto> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: questionnaireId },
      relations: ['questions', 'questions.options'],
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${questionnaireId} non trouvé`)
    }

    if (!questionnaire.isActive) {
      throw new BadRequestException('Ce questionnaire est inactif')
    }

    if (!questionnaire.questions || questionnaire.questions.length === 0) {
      throw new BadRequestException('Le questionnaire ne contient aucune question')
    }

    const { totalScore, maxScore, answerEntities } = this.processAnswers(
      questionnaire,
      submitDto.answers,
    )
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0
    const { level, interpretation, recommendations } = this.interpretHolmesRahe(totalScore)

    const diagnostic = await this.stressDiagnosticRepository.createAndSave({
      questionnaire,
      questionnaire_id: questionnaireId,
      utilisateur_id: currentUser.sub,
      totalScore,
      maxScore,
      percentage,
      level,
      interpretation,
      recommendations,
      answers: answerEntities,
    })

    return {
      success: true,
      diagnosticId: diagnostic.id,
      result: {
        totalScore: diagnostic.totalScore,
        maxScore: diagnostic.maxScore,
        percentage: diagnostic.percentage,
        level: diagnostic.level,
        interpretation: diagnostic.interpretation,
        recommendations: diagnostic.recommendations || [],
      },
      submittedAt: diagnostic.submittedAt,
    }
  }

  async getHistory(
    currentUser: AuthenticatedUser,
    query: StressDiagnosticHistoryQueryDto,
  ): Promise<StressDiagnosticHistoryResponseDto> {
    const targetUserId = query.utilisateurId || currentUser.sub

    if (targetUserId !== currentUser.sub && currentUser.role !== 'admin') {
      throw new ForbiddenException('Vous ne pouvez consulter que votre propre historique')
    }

    const page = query.page || 1
    const limit = query.limit || 10

    const { diagnostics, total } = await this.stressDiagnosticRepository.findByUtilisateurId(
      targetUserId,
      page,
      limit,
    )

    return {
      diagnostics: diagnostics.map((d) => this.mapToHistoryItem(d)),
      total,
      page,
      limit,
    }
  }

  async getDiagnosticById(
    diagnosticId: string,
    currentUser: AuthenticatedUser,
  ): Promise<StressDiagnosticHistoryItemDto> {
    const diagnostic = await this.stressDiagnosticRepository.findById(diagnosticId)

    if (!diagnostic) {
      throw new NotFoundException(`Diagnostic avec l'ID ${diagnosticId} non trouvé`)
    }

    if (diagnostic.utilisateur_id !== currentUser.sub && currentUser.role !== 'admin') {
      throw new ForbiddenException('Vous ne pouvez consulter que vos propres diagnostics')
    }

    return this.mapToHistoryItem(diagnostic)
  }

  private processAnswers(questionnaire: Questionnaire, answers: SubmitStressDiagnosticAnswerDto[]) {
    const questionMap = new Map(questionnaire.questions.map((q) => [q.id, q]))
    let totalScore = 0
    let maxScore = 0

    for (const question of questionnaire.questions) {
      const maxOptionScore = Math.max(...(question.options || []).map((o) => o.score), 0)
      maxScore += maxOptionScore
    }

    const answerEntities: Array<{
      question_id: string
      option_id: string
      score: number
    }> = []

    const answeredQuestionIds = new Set<string>()

    for (const answer of answers) {
      if (answeredQuestionIds.has(answer.questionId)) {
        throw new BadRequestException(`La question ${answer.questionId} a déjà été répondue`)
      }

      const question = questionMap.get(answer.questionId)
      if (!question) {
        throw new BadRequestException(
          `La question ${answer.questionId} n'appartient pas au questionnaire`,
        )
      }

      const option = (question.options || []).find((o) => o.id === answer.optionId)
      if (!option) {
        throw new BadRequestException(
          `L'option ${answer.optionId} n'appartient pas à la question ${answer.questionId}`,
        )
      }

      answeredQuestionIds.add(answer.questionId)
      totalScore += option.score

      answerEntities.push({
        question_id: answer.questionId,
        option_id: answer.optionId,
        score: option.score,
      })
    }

    return { totalScore, maxScore, answerEntities }
  }

  private interpretHolmesRahe(totalScore: number): {
    level: string
    interpretation: string
    recommendations: string[]
  } {
    if (totalScore < 150) {
      return {
        level: 'LOW',
        interpretation:
          'Votre niveau de stress est faible. Vous avez un risque modéré de développer des problèmes de santé liés au stress.',
        recommendations: [
          'Continuez à maintenir un mode de vie équilibré',
          'Pratiquez régulièrement des activités de détente',
          'Maintenez vos liens sociaux et familiaux',
        ],
      }
    }

    if (totalScore < 300) {
      return {
        level: 'MODERATE',
        interpretation:
          'Votre niveau de stress est modéré. Vous avez un risque accru (50%) de développer des problèmes de santé liés au stress.',
        recommendations: [
          'Accordez-vous des moments de repos et de récuperation',
          'Pratiquez des exercices de respiration et de relaxation',
          'Parlez de vos préoccupations a un proche ou un professionnel',
          'Envisagez des techniques de gestion du stress comme la cohérence cardiaque',
        ],
      }
    }

    return {
      level: 'HIGH',
      interpretation:
        'Votre niveau de stress est élevé. Vous avez un risque important (80%) de développer des problèmes de santé liés au stress.',
      recommendations: [
        'Consultez un professionnel de santé ou un psychologue',
        'Mettez en place des exercices quotidiens de relaxation',
        'Réduisez vos engagements si possible',
        'Pratiquez la cohérence cardiaque plusieurs fois par jour',
        'Maintenez une activité physique régulière',
        "N'hésitez pas à demander de l'aide à votre entourage",
      ],
    }
  }

  private mapToHistoryItem(diagnostic: StressDiagnosticResult): StressDiagnosticHistoryItemDto {
    return {
      id: diagnostic.id,
      questionnaireId: diagnostic.questionnaire_id,
      questionnaireTitle: diagnostic.questionnaire?.title || '',
      result: {
        totalScore: diagnostic.totalScore,
        maxScore: diagnostic.maxScore,
        percentage: diagnostic.percentage,
        level: diagnostic.level,
        interpretation: diagnostic.interpretation,
        recommendations: diagnostic.recommendations || [],
      },
      submittedAt: diagnostic.submittedAt,
    }
  }
}
