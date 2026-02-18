import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilisateurModule } from '../utilisateurs/utilisateurs.module'
import { QuestionnaireController } from './controllers/questionnaire.controller'
import { Questionnaire } from './entities/questionnaire.entity'
import { QuestionnaireRepository } from './repositories/questionnaire.repository'
import { QuestionnaireService } from './services/questionnaire.service'

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire]), UtilisateurModule],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, QuestionnaireRepository],
  exports: [QuestionnaireService, QuestionnaireRepository],
})
export class QuestionnairesModule {}
