import { Module } from '@nestjs/common'
import { UtilisateurModule } from 'src/utilisateurs/utilisateurs.module'
import { AuthController } from './auth.controller'

@Module({
  imports: [UtilisateurModule],
  controllers: [AuthController],
})
export class AuthModule {}
