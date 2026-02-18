import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Questionnaire } from '../entities/questionnaire.entity'
import { QuestionnaireService } from '../services/questionnaire.service'

@Controller('questionnaires')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Get()
  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return this.questionnaireService.getAllQuestionnaires()
  }

  @Get(':id')
  async getQuestionnaireById(@Param('id', ParseIntPipe) id: number): Promise<Questionnaire> {
    return this.questionnaireService.getQuestionnaireById(id)
  }

  @Get('createur/:createur_id')
  async getQuestionnairesByCreateur(
    @Param('createur_id', ParseIntPipe) createur_id: number,
  ): Promise<Questionnaire[]> {
    return this.questionnaireService.getQuestionnairesByCreateur(createur_id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestionnaire(
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    return this.questionnaireService.createQuestionnaire(createQuestionnaireDto)
  }

  @Put(':id')
  async updateQuestionnaire(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<Questionnaire> {
    return this.questionnaireService.updateQuestionnaire(id, updateQuestionnaireDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestionnaire(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.questionnaireService.deleteQuestionnaire(id)
  }
}
