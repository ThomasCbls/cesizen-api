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
}
