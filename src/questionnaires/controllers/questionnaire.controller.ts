import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Roles } from '../../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/admin-question.dto'
import { CreateEventDto, UpdateEventDto, UpdateEventScoreDto } from '../dtos/admin-event.dto'
import { Questionnaire } from '../entities/questionnaire.entity'
import { Question } from '../entities/question.entity'
import { Event } from '../entities/event.entity'
import { QuestionnaireService } from '../services/questionnaire.service'

@Controller('questionnaires')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Get()
  async getAllQuestionnaires(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.questionnaireService.getAllQuestionnaires({
      category,
      limit,
      page,
      sortBy,
      sortOrder,
    })
  }

  @Get(':id')
  async getQuestionnaireById(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionnaireService.getQuestionnaireById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createQuestionnaire(@Body() createQuestionnaireDto: CreateQuestionnaireDto) {
    return this.questionnaireService.createQuestionnaire(createQuestionnaireDto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateQuestionnaire(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ) {
    return this.questionnaireService.updateQuestionnaire(id, updateQuestionnaireDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteQuestionnaire(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.questionnaireService.deleteQuestionnaire(id)
  }

  // ========== ADMINISTRATION DES QUESTIONS ==========

  @Get(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getQuestionnaireQuestions(@Param('id', ParseIntPipe) id: number): Promise<Question[]> {
    return this.questionnaireService.getQuestionsByQuestionnaire(id)
  }

  @Post(':id/questions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async addQuestion(
    @Param('id', ParseIntPipe) questionnaireId: number,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionnaireService.addQuestionToQuestionnaire(
      questionnaireId,
      createQuestionDto.question,
      createQuestionDto.order,
    )
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionnaireService.updateQuestion(
      questionId,
      updateQuestionDto.question,
      updateQuestionDto.order,
    )
  }

  @Delete('questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<void> {
    return this.questionnaireService.deleteQuestion(questionId)
  }

  // ========== ADMINISTRATION DES ÉVÉNEMENTS (SCORES) ==========

  @Get(':id/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getQuestionnaireEvents(@Param('id', ParseIntPipe) id: number): Promise<Event[]> {
    return this.questionnaireService.getEventsByQuestionnaire(id)
  }

  @Post(':id/events')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async addEvent(
    @Param('id', ParseIntPipe) questionnaireId: number,
    @Body() createEventDto: CreateEventDto,
  ): Promise<Event> {
    return this.questionnaireService.addEventToQuestionnaire(
      questionnaireId,
      createEventDto.event,
      createEventDto.points,
    )
  }

  @Patch('events/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.questionnaireService.updateEvent(
      eventId,
      updateEventDto.event,
      updateEventDto.points,
    )
  }

  @Patch('events/:eventId/score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateEventScore(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateScoreDto: UpdateEventScoreDto,
  ): Promise<Event> {
    return this.questionnaireService.updateEventScore(eventId, updateScoreDto.points)
  }

  @Delete('events/:eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteEvent(@Param('eventId', ParseIntPipe) eventId: number): Promise<void> {
    return this.questionnaireService.deleteEvent(eventId)
  }
}
