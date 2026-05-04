import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { UtilisateurModule } from '../utilisateurs/utilisateurs.module'
import { InformationsModule } from '../informations/informations.module'
import { QuestionnairesModule } from '../questionnaires/questionnaires.module'

@Module({
  imports: [UtilisateurModule, InformationsModule, QuestionnairesModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
