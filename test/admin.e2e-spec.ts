import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { AdminController } from '../src/admin/admin.controller'
import { AdminService } from '../src/admin/admin.service'
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../src/auth/guards/roles.guard'

const USER_ID = '08f6f8c2-2f35-43a9-96df-9cc6e7d38101'
const INFO_ID = 1
const QUESTIONNAIRE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mockUser = {
  id_utilisateur: USER_ID,
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@test.dev',
  role: 'user',
  est_actif: true,
  date_inscription: '2026-01-01T00:00:00.000Z',
}

const mockInfo = {
  id_information: INFO_ID,
  titre: 'Gérer le stress au travail',
  contenu: 'Voici quelques conseils pour gérer le stress au travail.',
  type_contenu: 'article',
  slug: 'gerer-le-stress-au-travail',
  est_actif: true,
  ordre_affichage: 1,
  date_creation: '2026-01-01T00:00:00.000Z',
  date_modification: '2026-01-01T00:00:00.000Z',
}

const mockQuestionnaire = {
  id: QUESTIONNAIRE_ID,
  title: 'Echelle de Holmes et Rahe',
  description: 'Questionnaire de stress',
  category: 'STRESS',
  isActive: true,
}

const mockStats = { total: 10, active: 8, inactive: 2, admins: 1, users: 9, recentRegistrations: 3 }
const mockDashboard = { users: mockStats, informations: 5, questionnaires: 2 }

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: Record<string, string> }>()
    req.user = {
      sub: USER_ID,
      email: 'admin@test.dev',
      role: 'admin',
      nom: 'Admin',
      prenom: 'Test',
    }
    return true
  }
}

class TestRolesGuard implements CanActivate {
  canActivate(): boolean {
    return true
  }
}

describe('Admin (e2e)', () => {
  let app: INestApplication<App>

  const mockService = {
    getAllUsers: jest.fn().mockResolvedValue([mockUser]),
    getUserStats: jest.fn().mockResolvedValue(mockStats),
    deactivateUser: jest.fn().mockResolvedValue({ ...mockUser, est_actif: false }),
    activateUser: jest.fn().mockResolvedValue({ ...mockUser, est_actif: true }),
    changeUserRole: jest.fn().mockResolvedValue({ ...mockUser, role: 'admin' }),
    deleteUser: jest.fn().mockResolvedValue(undefined),
    getAllInformations: jest.fn().mockResolvedValue([mockInfo]),
    createInformation: jest.fn().mockResolvedValue(mockInfo),
    updateInformation: jest.fn().mockResolvedValue({ ...mockInfo, titre: 'Titre modifié' }),
    deactivateInformation: jest.fn().mockResolvedValue({ ...mockInfo, est_actif: false }),
    deleteInformation: jest.fn().mockResolvedValue(undefined),
    getAllQuestionnaires: jest.fn().mockResolvedValue([mockQuestionnaire]),
    getQuestionnaireQuestions: jest.fn().mockResolvedValue([]),
    getDashboardStats: jest.fn().mockResolvedValue(mockDashboard),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(TestRolesGuard)
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    await app.init()

    jest.clearAllMocks()
    Object.values(mockService).forEach((fn) => {
      if (jest.isMockFunction(fn)) fn.mockReset()
    })
    mockService.getAllUsers.mockResolvedValue([mockUser])
    mockService.getUserStats.mockResolvedValue(mockStats)
    mockService.deactivateUser.mockResolvedValue({ ...mockUser, est_actif: false })
    mockService.activateUser.mockResolvedValue({ ...mockUser, est_actif: true })
    mockService.changeUserRole.mockResolvedValue({ ...mockUser, role: 'admin' })
    mockService.deleteUser.mockResolvedValue(undefined)
    mockService.getAllInformations.mockResolvedValue([mockInfo])
    mockService.createInformation.mockResolvedValue(mockInfo)
    mockService.updateInformation.mockResolvedValue({ ...mockInfo, titre: 'Titre modifié' })
    mockService.deactivateInformation.mockResolvedValue({ ...mockInfo, est_actif: false })
    mockService.deleteInformation.mockResolvedValue(undefined)
    mockService.getAllQuestionnaires.mockResolvedValue([mockQuestionnaire])
    mockService.getQuestionnaireQuestions.mockResolvedValue([])
    mockService.getDashboardStats.mockResolvedValue(mockDashboard)
  })

  afterEach(async () => {
    await app.close()
  })

  // ====== UTILISATEURS ======

  it('GET /admin/utilisateurs - returns all users', () => {
    return request(app.getHttpServer())
      .get('/admin/utilisateurs')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect([mockUser])
  })

  it('GET /admin/utilisateurs/stats - returns user statistics', () => {
    return request(app.getHttpServer())
      .get('/admin/utilisateurs/stats')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect(mockStats)
  })

  it('PATCH /admin/utilisateurs/:id/deactivate - deactivates a user', () => {
    return request(app.getHttpServer())
      .patch(`/admin/utilisateurs/${USER_ID}/deactivate`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, est_actif: false })
  })

  it('PATCH /admin/utilisateurs/:id/activate - activates a user', () => {
    return request(app.getHttpServer())
      .patch(`/admin/utilisateurs/${USER_ID}/activate`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, est_actif: true })
  })

  it('PATCH /admin/utilisateurs/:id/role - changes user role', () => {
    return request(app.getHttpServer())
      .patch(`/admin/utilisateurs/${USER_ID}/role`)
      .set('Authorization', 'Bearer jwt-token')
      .send({ role: 'admin' })
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, role: 'admin' })
  })

  it('DELETE /admin/utilisateurs/:id - deletes user and returns 204', () => {
    return request(app.getHttpServer())
      .delete(`/admin/utilisateurs/${USER_ID}`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.NO_CONTENT)
  })

  // ====== INFORMATIONS ======

  it('GET /admin/informations - returns all informations', () => {
    return request(app.getHttpServer())
      .get('/admin/informations')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect([mockInfo])
  })

  it('GET /admin/informations?type=article - filters informations by type', () => {
    return request(app.getHttpServer())
      .get('/admin/informations?type=article')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(mockService.getAllInformations).toHaveBeenCalledWith('article')
        expect(res.body).toEqual([mockInfo])
      })
  })

  it('POST /admin/informations - creates information and returns 201', () => {
    return request(app.getHttpServer())
      .post('/admin/informations')
      .set('Authorization', 'Bearer jwt-token')
      .send({
        titre: 'Gérer le stress au travail',
        contenu: 'Voici quelques conseils pour gérer le stress au travail.',
        type_contenu: 'article',
      })
      .expect(HttpStatus.CREATED)
      .expect(mockInfo)
  })

  it('PATCH /admin/informations/:id - updates information', () => {
    return request(app.getHttpServer())
      .patch(`/admin/informations/${INFO_ID}`)
      .set('Authorization', 'Bearer jwt-token')
      .send({ titre: 'Titre modifié' })
      .expect(HttpStatus.OK)
      .expect({ ...mockInfo, titre: 'Titre modifié' })
  })

  it('PATCH /admin/informations/:id/deactivate - deactivates information', () => {
    return request(app.getHttpServer())
      .patch(`/admin/informations/${INFO_ID}/deactivate`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect({ ...mockInfo, est_actif: false })
  })

  it('DELETE /admin/informations/:id - deletes information and returns 204', () => {
    return request(app.getHttpServer())
      .delete(`/admin/informations/${INFO_ID}`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.NO_CONTENT)
  })

  // ====== QUESTIONNAIRES ======

  it('GET /admin/questionnaires - returns all questionnaires', () => {
    return request(app.getHttpServer())
      .get('/admin/questionnaires')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect([mockQuestionnaire])
  })

  it('GET /admin/questionnaires/:id/questions - returns questions for a questionnaire', () => {
    return request(app.getHttpServer())
      .get(`/admin/questionnaires/${QUESTIONNAIRE_ID}/questions`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect([])
  })

  // ====== DASHBOARD ======

  it('GET /admin/dashboard - returns dashboard statistics', () => {
    return request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect(mockDashboard)
  })
})
