import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Option } from '../entities/option.entity'
import { Question } from '../entities/question.entity'
import { Questionnaire } from '../entities/questionnaire.entity'

interface QuestionnairesQueryParams {
  category?: string
  limit?: number
  page?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  async getAllQuestionnaires(params: QuestionnairesQueryParams) {
    const { category, limit, page, sortBy, sortOrder } = params
    const qb = this.questionnaireRepository.createQueryBuilder('q')

    if (category) {
      qb.andWhere('q.category = :category', { category })
    }

    qb.andWhere('q.isActive = :isActive', { isActive: true })

    const orderField = sortBy || 'createdAt'
    const orderDir = sortOrder || 'DESC'
    qb.orderBy(`q.${orderField}`, orderDir)

    const total = await qb.getCount()

    if (limit) {
      qb.take(limit)
    }
    if (page && limit) {
      qb.skip((page - 1) * limit)
    }

    const questionnaires = await qb.getMany()

    return {
      questionnaires: questionnaires.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        isActive: q.isActive,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      })),
      total,
    }
  }

  async getQuestionnaireById(id: string) {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${id} non trouvé`)
    }

    const sortedQuestions = [...(questionnaire.questions || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    )

    return {
      questionnaire: {
        id: questionnaire.id,
        title: questionnaire.title,
        description: questionnaire.description,
        category: questionnaire.category,
        isActive: questionnaire.isActive,
        questions: sortedQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          order: q.order,
          options: (q.options || []).map((o) => ({
            id: o.id,
            text: o.text,
            score: o.score,
          })),
        })),
        createdAt: questionnaire.createdAt,
        updatedAt: questionnaire.updatedAt,
      },
    }
  }

  async createQuestionnaire(dto: CreateQuestionnaireDto) {
    const questionnaire = this.questionnaireRepository.create({
      title: dto.title,
      description: dto.description,
      category: dto.category || 'STRESS',
      isActive: true,
      createur_id: dto.createur_id,
    })

    const saved = await this.questionnaireRepository.save(questionnaire)

    if (dto.questions && dto.questions.length > 0) {
      for (const questionDto of dto.questions) {
        const question = this.questionRepository.create({
          text: questionDto.text,
          order: questionDto.order,
          questionnaire: saved,
        })
        const savedQuestion = await this.questionRepository.save(question)

        if (questionDto.options && questionDto.options.length > 0) {
          const options = questionDto.options.map((optDto) =>
            this.optionRepository.create({
              text: optDto.text,
              score: optDto.score,
              question: savedQuestion,
            }),
          )
          await this.optionRepository.save(options)
        }
      }
    }

    return this.getQuestionnaireById(saved.id)
  }

  async updateQuestionnaire(id: string, dto: UpdateQuestionnaireDto) {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${id} non trouvé`)
    }

    if (dto.title !== undefined) questionnaire.title = dto.title
    if (dto.description !== undefined) questionnaire.description = dto.description
    if (dto.category !== undefined) questionnaire.category = dto.category
    if (dto.isActive !== undefined) questionnaire.isActive = dto.isActive

    await this.questionnaireRepository.save(questionnaire)
    return this.getQuestionnaireById(id)
  }

  async deleteQuestionnaire(id: string): Promise<void> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${id} non trouvé`)
    }

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

  // ========== MÉTHODES D'ADMINISTRATION ==========

  async addQuestionToQuestionnaire(
    questionnaireId: number,
    questionText: string,
    order?: number,
  ): Promise<Question> {
    const questionnaire = await this.getQuestionnaireById(questionnaireId)

    const question = this.questionRepository.create({
      question: questionText,
      order: order || (questionnaire.questions?.length || 0) + 1,
      questionnaire: questionnaire,
    })

    return await this.questionRepository.save(question)
  }

  async updateQuestion(
    questionId: number,
    questionText?: string,
    order?: number,
  ): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id_Question: questionId },
      relations: ['questionnaire'],
    })

    if (!question) {
      throw new NotFoundException(`Question avec l'ID ${questionId} non trouvée`)
    }

    if (questionText !== undefined) {
      question.question = questionText
    }
    if (order !== undefined) {
      question.order = order
    }

    return await this.questionRepository.save(question)
  }

  async deleteQuestion(questionId: number): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id_Question: questionId },
    })

    if (!question) {
      throw new NotFoundException(`Question avec l'ID ${questionId} non trouvée`)
    }

    await this.questionRepository.remove(question)
  }

  async addEventToQuestionnaire(
    questionnaireId: number,
    eventText: string,
    points: number,
  ): Promise<Event> {
    const questionnaire = await this.getQuestionnaireById(questionnaireId)

    const event = this.eventRepository.create({
      event: eventText,
      points: points,
      questionnaire: questionnaire,
    })

    return await this.eventRepository.save(event)
  }

  async updateEventScore(eventId: number, newPoints: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id_Event: eventId },
      relations: ['questionnaire'],
    })

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`)
    }

    event.points = newPoints
    return await this.eventRepository.save(event)
  }

  async updateEvent(eventId: number, eventText?: string, points?: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id_Event: eventId },
      relations: ['questionnaire'],
    })

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`)
    }

    if (eventText !== undefined) {
      event.event = eventText
    }
    if (points !== undefined) {
      event.points = points
    }

    return await this.eventRepository.save(event)
  }

  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id_Event: eventId },
    })

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`)
    }

    await this.eventRepository.remove(event)
  }

  async getQuestionsByQuestionnaire(questionnaireId: number): Promise<Question[]> {
    const questionnaire = await this.getQuestionnaireById(questionnaireId)
    return questionnaire.questions || []
  }

  async getEventsByQuestionnaire(questionnaireId: number): Promise<Event[]> {
    const questionnaire = await this.getQuestionnaireById(questionnaireId)
    return questionnaire.events || []
  }
}
