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
  Query,
  UseGuards,
} from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CreateInformationDto } from '../informations/dtos/create-information.dto'
import { InformationResponseDto } from '../informations/dtos/information-response.dto'
import { UpdateInformationDto } from '../informations/dtos/update-information.dto'
import { UtilisateurResponseDto } from '../utilisateurs/dtos/utilisateur-response.dto'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== GESTION DES UTILISATEURS ==========
  @Get('utilisateurs')
  async getAllUsers(): Promise<UtilisateurResponseDto[]> {
    return this.adminService.getAllUsers()
  }

  @Get('utilisateurs/stats')
  async getUserStats(): Promise<any> {
    return this.adminService.getUserStats()
  }

  @Patch('utilisateurs/:id/deactivate')
  async deactivateUser(@Param('id') id: string): Promise<UtilisateurResponseDto> {
    return this.adminService.deactivateUser(id)
  }

  @Patch('utilisateurs/:id/activate')
  async activateUser(@Param('id') id: string): Promise<UtilisateurResponseDto> {
    return this.adminService.activateUser(id)
  }

  @Patch('utilisateurs/:id/role')
  async changeUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ): Promise<UtilisateurResponseDto> {
    return this.adminService.changeUserRole(id, role)
  }

  @Delete('utilisateurs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id)
  }

  // ========== GESTION DU CONTENU INFORMATIF ==========
  @Get('informations')
  async getAllInformations(@Query('type') type?: string): Promise<InformationResponseDto[]> {
    return this.adminService.getAllInformations(type)
  }

  @Post('informations')
  @HttpCode(HttpStatus.CREATED)
  async createInformation(
    @Body() createInformationDto: CreateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.adminService.createInformation(createInformationDto)
  }

  @Patch('informations/:id')
  async updateInformation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.adminService.updateInformation(id, updateInformationDto)
  }

  @Patch('informations/:id/deactivate')
  async deactivateInformation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InformationResponseDto> {
    return this.adminService.deactivateInformation(id)
  }

  @Delete('informations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInformation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteInformation(id)
  }

  // ========== GESTION DES QUESTIONNAIRES ==========
  @Get('questionnaires')
  async getAllQuestionnaires(): Promise<any> {
    return this.adminService.getAllQuestionnaires()
  }

  @Get('questionnaires/:id/questions')
  async getQuestionnaireQuestions(@Param('id') id: string): Promise<any[]> {
    return this.adminService.getQuestionnaireQuestions(id)
  }

  // ========== STATISTIQUES GLOBALES ==========
  @Get('dashboard')
  async getDashboardStats(): Promise<any> {
    return this.adminService.getDashboardStats()
  }
}
