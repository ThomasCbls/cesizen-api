import { Module } from '@nestjs/common'
import { InformationsModule } from '../informations/informations.module'
import { QuestionnairesModule } from '../questionnaires/questionnaires.module'
import { StressDiagnosticModule } from '../stress-diagnostic/stress-diagnostic.module'
import { UtilisateurModule } from '../utilisateurs/utilisateurs.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [UtilisateurModule, InformationsModule, QuestionnairesModule, StressDiagnosticModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
