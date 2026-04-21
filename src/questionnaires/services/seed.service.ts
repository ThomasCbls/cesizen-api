import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Option } from '../entities/option.entity'
import { Question } from '../entities/question.entity'
import { Questionnaire } from '../entities/questionnaire.entity'

const HOLMES_RAHE_EVENTS = [
  { text: 'Décès du conjoint', score: 100 },
  { text: 'Divorce', score: 73 },
  { text: 'Séparation conjugale', score: 65 },
  { text: 'Emprisonnement', score: 63 },
  { text: "Décès d'un parent proche", score: 63 },
  { text: 'Blessure ou maladie personnelle', score: 53 },
  { text: 'Mariage', score: 50 },
  { text: 'Licenciement', score: 47 },
  { text: 'Réconciliation conjugale', score: 45 },
  { text: 'Retraite', score: 45 },
  { text: "Changement de santé d'un membre de la famille", score: 44 },
  { text: 'Grossesse', score: 40 },
  { text: 'Difficultés sexuelles', score: 39 },
  { text: "Arrivée d'un nouveau membre dans la famille", score: 39 },
  { text: 'Changement dans les affaires', score: 39 },
  { text: 'Changement de situation financière', score: 38 },
  { text: "Décès d'un ami proche", score: 37 },
  { text: 'Changement de métier', score: 36 },
  { text: 'Modification du nombre de disputes conjugales', score: 35 },
  { text: 'Hypothèque ou emprunt important', score: 31 },
  { text: "Saisie d'une hypothèque ou d'un prêt", score: 30 },
  { text: 'Changement de responsabilités professionnelles', score: 29 },
  { text: "Départ d'un enfant du foyer", score: 29 },
  { text: 'Difficultés avec la belle-famille', score: 29 },
  { text: 'Réalisation personnelle exceptionnelle', score: 28 },
  { text: 'Début ou arrêt de travail du conjoint', score: 26 },
  { text: "Début ou fin d'études", score: 26 },
  { text: 'Changement des conditions de vie', score: 25 },
  { text: 'Modification des habitudes personnelles', score: 24 },
  { text: 'Difficultés avec un supérieur hiérarchique', score: 23 },
  { text: "Changement d'horaires ou de conditions de travail", score: 20 },
  { text: 'Déménagement', score: 20 },
  { text: "Changement d'école", score: 20 },
  { text: 'Changement de loisirs', score: 19 },
  { text: "Changement d'activités religieuses", score: 19 },
  { text: "Changement d'activités sociales", score: 18 },
  { text: 'Hypothèque ou emprunt peu important', score: 17 },
  { text: 'Changement des habitudes de sommeil', score: 16 },
  { text: 'Changement du nombre de réunions familiales', score: 15 },
  { text: 'Changement des habitudes alimentaires', score: 15 },
  { text: 'Vacances', score: 13 },
  { text: "Fêtes de fin d'année", score: 12 },
  { text: 'Amendes ou infractions mineures', score: 11 },
]

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedStressQuestionnaire()
  }

  private async seedStressQuestionnaire() {
    const existing = await this.questionnaireRepository.findOne({
      where: { category: 'STRESS', isActive: true },
      relations: { questions: { options: true } },
    })

    const hasCompleteQuestions =
      existing?.questions?.length === HOLMES_RAHE_EVENTS.length &&
      existing.questions.every((question) => question.options?.length === 2)

    if (hasCompleteQuestions) {
      this.logger.log('Le questionnaire de stress Holmes & Rahe existe deja')
      return
    }

    let savedQuestionnaire: Questionnaire

    if (existing) {
      savedQuestionnaire = existing

      this.logger.warn(
        'Questionnaire de stress existant incomplet detecte, reinitialisation des questions...',
      )

      await this.questionRepository
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where('questionnaire_id = :questionnaireId', { questionnaireId: existing.id })
        .execute()
    } else {
      this.logger.log('Creation du questionnaire de stress Holmes & Rahe...')

      const questionnaire = this.questionnaireRepository.create({
        title: 'Échelle de Holmes et Rahe',
        description:
          "Cette échelle exploite une liste d'événements vécus dans les 12 derniers mois et associés à un nombre de points. Plus le total de points est important, plus le niveau de stress est élevé.",
        category: 'STRESS',
        isActive: true,
      })

      savedQuestionnaire = await this.questionnaireRepository.save(questionnaire)
    }

    for (let i = 0; i < HOLMES_RAHE_EVENTS.length; i++) {
      const event = HOLMES_RAHE_EVENTS[i]

      const question = this.questionRepository.create({
        text: event.text,
        order: i + 1,
        questionnaire: savedQuestionnaire,
      })

      const savedQuestion = await this.questionRepository.save(question)

      const options = [
        this.optionRepository.create({
          text: 'Oui, dans les 12 derniers mois',
          score: event.score,
          question: savedQuestion,
        }),
        this.optionRepository.create({
          text: 'Non',
          score: 0,
          question: savedQuestion,
        }),
      ]

      await this.optionRepository.save(options)
    }

    this.logger.log(
      `Questionnaire de stress Holmes & Rahe cree avec ${HOLMES_RAHE_EVENTS.length} questions`,
    )
  }
}
