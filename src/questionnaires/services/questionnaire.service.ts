import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UtilisateurRepository } from '../../utilisateurs/repositories/utilisateur.repository'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { QuestionnaireType } from '../enums/questionnaire-type.enum'
import { Event } from '../entities/event.entity'
import { Question } from '../entities/question.entity'
import { Questionnaire } from '../entities/questionnaire.entity'

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {}

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    try {
      const questionnaires = await this.questionnaireRepository.find({
        relations: ['createur', 'events', 'questions'],
        order: { date_creation: 'DESC' },
      })

      return questionnaires.map((questionnaire) => this.sortQuestionnaireRelations(questionnaire))
    } catch {
      throw new BadRequestException('Erreur lors de la récupération des questionnaires')
    }
  }

  async getQuestionnaireById(id: number): Promise<Questionnaire> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID invalide')
    }

    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id_Questionnaire: id },
      relations: ['createur', 'events', 'questions'],
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${id} non trouvé`)
    }

    return questionnaire
  }

  async getQuestionnairesByCreateur(createur_id: string): Promise<Questionnaire[]> {
    if (!createur_id) {
      throw new BadRequestException('ID créateur invalide')
    }

    const utilisateur = await this.utilisateurRepository.findById(createur_id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${createur_id} non trouvé`)
    }

    const questionnaires = await this.questionnaireRepository.find({
      where: { createur_id },
      relations: ['createur', 'events', 'questions'],
      order: { date_creation: 'DESC' },
    })

    return questionnaires.map((questionnaire) => this.sortQuestionnaireRelations(questionnaire))
  }

  async createQuestionnaire(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const utilisateur = await this.utilisateurRepository.findById(
      createQuestionnaireDto.createur_id,
    )

    if (!utilisateur) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${createQuestionnaireDto.createur_id} non trouvé`,
      )
    }

    this.validateStressQuestionnaire(createQuestionnaireDto)

    const questionnaire = this.questionnaireRepository.create({
      nom: createQuestionnaireDto.nom,
      description: createQuestionnaireDto.description,
      type: createQuestionnaireDto.type || QuestionnaireType.STRESS_DIAGNOSTIC,
      createur_id: createQuestionnaireDto.createur_id,
      events: [],
      questions: [],
    })

    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire)

    // Create events if provided
    if (createQuestionnaireDto.events && createQuestionnaireDto.events.length > 0) {
      const events = createQuestionnaireDto.events.map((eventDto) =>
        this.eventRepository.create({
          event: eventDto.event,
          points: eventDto.points,
          questionnaire: savedQuestionnaire,
        }),
      )
      savedQuestionnaire.events = await this.eventRepository.save(events)
    }

    // Create questions if provided
    if (createQuestionnaireDto.questions && createQuestionnaireDto.questions.length > 0) {
      const questions = createQuestionnaireDto.questions.map((questionDto) =>
        this.questionRepository.create({
          question: questionDto.question,
          order: questionDto.order,
          questionnaire: savedQuestionnaire,
        }),
      )
      savedQuestionnaire.questions = await this.questionRepository.save(questions)
    }

    return this.sortQuestionnaireRelations(savedQuestionnaire)
  }

  async updateQuestionnaire(
    id: number,
    updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const questionnaire = await this.getQuestionnaireById(id)

    if (updateQuestionnaireDto.createur_id) {
      const utilisateur = await this.utilisateurRepository.findById(
        updateQuestionnaireDto.createur_id,
      )

      if (!utilisateur) {
        throw new NotFoundException(
          `Utilisateur avec l'ID ${updateQuestionnaireDto.createur_id} non trouvé`,
        )
      }
    }

    this.validateStressQuestionnaire({
      nom: updateQuestionnaireDto.nom ?? questionnaire.nom,
      description: updateQuestionnaireDto.description ?? questionnaire.description,
      type: updateQuestionnaireDto.type ?? (questionnaire.type as QuestionnaireType),
      createur_id: updateQuestionnaireDto.createur_id ?? questionnaire.createur_id,
      events: questionnaire.events,
      questions: questionnaire.questions,
    })

    Object.assign(questionnaire, updateQuestionnaireDto)
    const updatedQuestionnaire = await this.questionnaireRepository.save(questionnaire)
    return this.sortQuestionnaireRelations(updatedQuestionnaire)
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    const questionnaire = await this.getQuestionnaireById(id)
    await this.questionnaireRepository.remove(questionnaire)
  }

  private validateStressQuestionnaire(
    questionnaire: Pick<
      CreateQuestionnaireDto,
      'nom' | 'description' | 'type' | 'createur_id' | 'events' | 'questions'
    >,
  ): void {
    const type = questionnaire.type || QuestionnaireType.STRESS_DIAGNOSTIC

    if (type !== QuestionnaireType.STRESS_DIAGNOSTIC) {
      throw new BadRequestException('Seul le type stress_diagnostic est autorisé')
    }

    if (!questionnaire.questions || questionnaire.questions.length === 0) {
      throw new BadRequestException(
        'Un questionnaire de stress doit contenir au moins une question',
      )
    }

    if (!questionnaire.events || questionnaire.events.length < 2) {
      throw new BadRequestException(
        'Un questionnaire de stress doit contenir au moins deux niveaux de réponse',
      )
    }
  }

  private sortQuestionnaireRelations(questionnaire: Questionnaire): Questionnaire {
    questionnaire.questions = [...(questionnaire.questions || [])].sort(
      (left, right) => (left.order || 0) - (right.order || 0),
    )
    questionnaire.events = [...(questionnaire.events || [])].sort(
      (left, right) => left.points - right.points,
    )

    return questionnaire
  }
}
