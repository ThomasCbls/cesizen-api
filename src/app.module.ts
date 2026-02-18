import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { QuestionnairesModule } from './questionnaires/questionnaires.module'
import { Utilisateur } from './utilisateurs/entities/utilisateur.entity'
import { UtilisateurModule } from './utilisateurs/utilisateurs.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'cesizen_db',
      entities: [Utilisateur],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    UtilisateurModule,
    AuthModule,
    QuestionnairesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
