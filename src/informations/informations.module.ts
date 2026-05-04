import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Information } from './entities/information.entity'
import { InformationService } from './services/information.service'
import { InformationController } from './controllers/information.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Information])],
  providers: [InformationService],
  controllers: [InformationController],
  exports: [InformationService],
})
export class InformationsModule {}
