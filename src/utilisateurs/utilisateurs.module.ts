import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { UtilisateurController } from './controllers/utilisateur.controller';
import { UtilisateurService } from './services/utilisateur.service';
import { UtilisateurRepository } from './repositories/utilisateur.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur])],
  controllers: [UtilisateurController],
  providers: [UtilisateurService, UtilisateurRepository],
  exports: [UtilisateurService],
})
export class UtilisateurModule {}
