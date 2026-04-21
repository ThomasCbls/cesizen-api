import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QuestionnaireController } from './controllers/questionnaire.controller'
import { Option } from './entities/option.entity'
import { Question } from './entities/question.entity'
import { Questionnaire } from './entities/questionnaire.entity'
import { QuestionnaireRepository } from './repositories/questionnaire.repository'
import { QuestionnaireService } from './services/questionnaire.service'
import { SeedService } from './services/seed.service'

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire, Question, Option])],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, QuestionnaireRepository, SeedService],
  exports: [QuestionnaireService, QuestionnaireRepository],
})
export class QuestionnairesModule {}
