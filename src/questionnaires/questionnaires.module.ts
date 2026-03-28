import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilisateurModule } from '../utilisateurs/utilisateurs.module'
import { QuestionnaireController } from './controllers/questionnaire.controller'
import { Event } from './entities/event.entity'
import { Question } from './entities/question.entity'
import { Questionnaire } from './entities/questionnaire.entity'
import { QuestionnaireRepository } from './repositories/questionnaire.repository'
import { QuestionnaireService } from './services/questionnaire.service'

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire, Event, Question]), UtilisateurModule],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, QuestionnaireRepository],
  exports: [QuestionnaireService, QuestionnaireRepository],
})
export class QuestionnairesModule {}
