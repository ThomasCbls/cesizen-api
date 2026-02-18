import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilisateurController } from './controllers/utilisateur.controller'
import { Utilisateur } from './entities/utilisateur.entity'
import { UtilisateurRepository } from './repositories/utilisateur.repository'
import { UtilisateurService } from './services/utilisateur.service'

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur])],
  controllers: [UtilisateurController],
  providers: [UtilisateurService, UtilisateurRepository],
  exports: [UtilisateurService, UtilisateurRepository],
})
export class UtilisateurModule {}
