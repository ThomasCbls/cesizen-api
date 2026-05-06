import { Injectable } from '@nestjs/common'
import { CreateInformationDto } from '../informations/dtos/create-information.dto'
import { InformationResponseDto } from '../informations/dtos/information-response.dto'
import { UpdateInformationDto } from '../informations/dtos/update-information.dto'
import { InformationService } from '../informations/services/information.service'
import { QuestionnaireService } from '../questionnaires/services/questionnaire.service'
import { UtilisateurResponseDto } from '../utilisateurs/dtos/utilisateur-response.dto'
import { UtilisateurRepository } from '../utilisateurs/repositories/utilisateur.repository'
import { UtilisateurService } from '../utilisateurs/services/utilisateur.service'

@Injectable()
export class AdminService {
  constructor(
    private readonly utilisateurService: UtilisateurService,
    private readonly informationService: InformationService,
    private readonly questionnaireService: QuestionnaireService,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {}

  // ========== GESTION DES UTILISATEURS ==========
  async getAllUsers(): Promise<UtilisateurResponseDto[]> {
    return this.utilisateurService.findAllForAdmin()
  }

  async getUserStats(): Promise<any> {
    const allUsers = await this.utilisateurRepository.findAll()
    const activeUsers = allUsers.filter((user) => user.est_actif)
    const inactiveUsers = allUsers.filter((user) => !user.est_actif)
    const adminUsers = allUsers.filter((user) => user.role === 'admin')
    const regularUsers = allUsers.filter((user) => user.role === 'user')

    return {
      total: allUsers.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      admins: adminUsers.length,
      users: regularUsers.length,
      recentRegistrations: this.getRecentRegistrations(allUsers),
    }
  }

  private getRecentRegistrations(users: any[]): number {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return users.filter((user) => new Date(user.date_inscription) > oneWeekAgo).length
  }

  async deactivateUser(id: string): Promise<UtilisateurResponseDto> {
    return this.utilisateurService.deactivateUser(id)
  }

  async activateUser(id: string): Promise<UtilisateurResponseDto> {
    return this.utilisateurService.activateUser(id)
  }

  async changeUserRole(id: string, role: string): Promise<UtilisateurResponseDto> {
    return this.utilisateurService.changeUserRole(id, role)
  }

  async deleteUser(id: string): Promise<void> {
    return this.utilisateurService.hardDeleteUser(id)
  }

  // ========== GESTION DU CONTENU INFORMATIF ==========
  async getAllInformations(type?: string): Promise<InformationResponseDto[]> {
    return this.informationService.findAllForAdmin()
  }

  async createInformation(
    createInformationDto: CreateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationService.create(createInformationDto)
  }

  async updateInformation(
    id: number,
    updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationService.update(id, updateInformationDto)
  }

  async deactivateInformation(id: number): Promise<InformationResponseDto> {
    return this.informationService.deactivate(id)
  }

  async deleteInformation(id: number): Promise<void> {
    return this.informationService.remove(id)
  }

  // ========== GESTION DES QUESTIONNAIRES ==========
  async getAllQuestionnaires(): Promise<any> {
    return this.questionnaireService.getAllQuestionnaires({})
  }

  async getQuestionnaireQuestions(questionnaireId: string): Promise<any[]> {
    const result = await this.questionnaireService.getQuestionnaireById(questionnaireId)
    return result.questionnaire.questions || []
  }

  // ========== STATISTIQUES GLOBALES ==========
  async getDashboardStats(): Promise<any> {
    const userStats = await this.getUserStats()
    const { questionnaires, total } = await this.getAllQuestionnaires()
    const informations = await this.getAllInformations()

    return {
      users: userStats,
      questionnaires: {
        total,
        active: questionnaires.filter((q: any) => q.isActive !== false).length,
      },
      informations: {
        total: informations.length,
        active: informations.filter((i) => i.est_actif).length,
      },
      lastUpdated: new Date().toISOString(),
    }
  }
}
