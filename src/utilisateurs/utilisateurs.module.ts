import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PasswordValidatorService } from '../auth/validators/password-validator.service'
import { UtilisateurController } from './controllers/utilisateur.controller'
import { PasswordHistory } from './entities/password-history.entity'
import { Utilisateur } from './entities/utilisateur.entity'
import { PasswordHistoryRepository } from './repositories/password-history.repository'
import { UtilisateurRepository } from './repositories/utilisateur.repository'
import { UtilisateurService } from './services/utilisateur.service'

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur, PasswordHistory])],
  controllers: [UtilisateurController],
  providers: [
    UtilisateurService,
    UtilisateurRepository,
    PasswordHistoryRepository,
    PasswordValidatorService,
  ],
  exports: [
    UtilisateurService,
    UtilisateurRepository,
    PasswordHistoryRepository,
    PasswordValidatorService,
  ],
})
export class UtilisateurModule {}
