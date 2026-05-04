import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Questionnaire } from '../entities/questionnaire.entity'

@Injectable()
export class QuestionnaireRepository extends Repository<Questionnaire> {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly repository: Repository<Questionnaire>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner)
  }

  async findAllQuestionnaires(): Promise<Questionnaire[]> {
    return this.repository.find({
      relations: ['questions', 'questions.options'],
      order: { createdAt: 'DESC' },
    })
  }

  async findQuestionnaireById(id: string): Promise<Questionnaire | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
    })
  }

  async findQuestionnairesByCreateur(createur_id: string): Promise<Questionnaire[]> {
    return this.repository.find({
      where: { createur_id },
      relations: ['questions', 'questions.options'],
      order: { createdAt: 'DESC' },
    })
  }

  async createQuestionnaire(questionnaire: Partial<Questionnaire>): Promise<Questionnaire> {
    const newQuestionnaire = this.repository.create(questionnaire)
    return this.repository.save(newQuestionnaire)
  }

  async updateQuestionnaire(
    id: string,
    questionnaire: Partial<Questionnaire>,
  ): Promise<Questionnaire | null> {
    await this.repository.update(id, questionnaire)
    return this.findQuestionnaireById(id)
  }

  async deleteQuestionnaire(id: string): Promise<boolean> {
    const result = await this.repository.delete(id)
    return (result?.affected ?? 0) > 0
  }
}
