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

  async findById(id: string): Promise<StressDiagnosticResult | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['questionnaire', 'answers'],
    })
  }

  async findByUtilisateurId(
    utilisateurId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ diagnostics: StressDiagnosticResult[]; total: number }> {
    const [diagnostics, total] = await this.repository.findAndCount({
      where: { utilisateur_id: utilisateurId },
      relations: ['questionnaire', 'answers'],
      order: { submittedAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return { diagnostics, total }
  }
}
