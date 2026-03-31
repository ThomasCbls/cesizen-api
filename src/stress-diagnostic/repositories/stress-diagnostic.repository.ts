import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { StressDiagnosticResult } from '../entities/stress-diagnostic-result.entity'

@Injectable()
export class StressDiagnosticRepository {
  constructor(
    @InjectRepository(StressDiagnosticResult)
    private readonly repository: Repository<StressDiagnosticResult>,
  ) {}

  async createAndSave(
    diagnostic: DeepPartial<StressDiagnosticResult>,
  ): Promise<StressDiagnosticResult> {
    const entity = this.repository.create(diagnostic)
    return this.repository.save(entity)
  }

  async findById(id: number): Promise<StressDiagnosticResult | null> {
    return this.repository.findOne({
      where: { id_diagnostic: id },
      relations: ['questionnaire', 'utilisateur', 'answers', 'answers.question', 'answers.event'],
    })
  }

  async findByUtilisateurId(utilisateurId: string): Promise<StressDiagnosticResult[]> {
    return this.repository.find({
      where: { utilisateur_id: utilisateurId },
      relations: ['questionnaire', 'utilisateur', 'answers', 'answers.question', 'answers.event'],
      order: { date_soumission: 'DESC' },
    })
  }
}
