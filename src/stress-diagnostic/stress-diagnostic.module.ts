import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Option } from '../questionnaires/entities/option.entity'
import { Question } from '../questionnaires/entities/question.entity'
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity'
import { StressDiagnosticController } from './controllers/stress-diagnostic.controller'
import { StressDiagnosticAnswer } from './entities/stress-diagnostic-answer.entity'
import { StressDiagnosticResult } from './entities/stress-diagnostic-result.entity'
import { StressDiagnosticRepository } from './repositories/stress-diagnostic.repository'
import { StressDiagnosticService } from './services/stress-diagnostic.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Questionnaire,
      Question,
      Option,
      StressDiagnosticResult,
      StressDiagnosticAnswer,
    ]),
  ],
  controllers: [StressDiagnosticController],
  providers: [StressDiagnosticService, StressDiagnosticRepository],
  exports: [StressDiagnosticService, StressDiagnosticRepository],
})
export class StressDiagnosticModule {}
