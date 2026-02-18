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
      relations: ['createur'],
      order: { date_creation: 'DESC' },
    })
  }

  async findQuestionnaireById(id: number): Promise<Questionnaire | null> {
    return this.repository.findOne({
      where: { id_Questionnaire: id },
      relations: ['createur'],
    })
  }

  async findQuestionnairesByCreateur(createur_id: number): Promise<Questionnaire[]> {
    return this.repository.find({
      where: { createur_id },
      relations: ['createur'],
      order: { date_creation: 'DESC' },
    })
  }

  async createQuestionnaire(questionnaire: Partial<Questionnaire>): Promise<Questionnaire> {
    const newQuestionnaire = this.repository.create(questionnaire)
    return this.repository.save(newQuestionnaire)
  }

  async updateQuestionnaire(
    id: number,
    questionnaire: Partial<Questionnaire>,
  ): Promise<Questionnaire | null> {
    await this.repository.update(id, questionnaire)
    return this.findQuestionnaireById(id)
  }

  async deleteQuestionnaire(id: number): Promise<boolean> {
    const result = await this.repository.delete(id)
    return (result?.affected ?? 0) > 0
  }
}
