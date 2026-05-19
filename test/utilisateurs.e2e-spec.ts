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
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../src/auth/guards/roles.guard'
import { UtilisateurController } from '../src/utilisateurs/controllers/utilisateur.controller'
import { UtilisateurService } from '../src/utilisateurs/services/utilisateur.service'

const USER_ID = '08f6f8c2-2f35-43a9-96df-9cc6e7d38101'

const mockUser = {
  id_utilisateur: USER_ID,
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@test.dev',
  role: 'user',
  est_actif: true,
  date_inscription: '2026-01-01T00:00:00.000Z',
}

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: Record<string, string> }>()
    req.user = {
      sub: USER_ID,
      email: 'jean.dupont@test.dev',
      role: 'admin',
      nom: 'Dupont',
      prenom: 'Jean',
    }
    return true
  }
}

class TestRolesGuard implements CanActivate {
  canActivate(): boolean {
    return true
  }
}

describe('Utilisateurs (e2e)', () => {
  let app: INestApplication<App>

  const mockService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, nom: 'Durant' }),
    remove: jest.fn().mockResolvedValue(undefined),
    validatePasswordForUser: jest.fn().mockResolvedValue(true),
    findAllForAdmin: jest.fn().mockResolvedValue([mockUser]),
    deactivateUser: jest.fn().mockResolvedValue({ ...mockUser, est_actif: false }),
    activateUser: jest.fn().mockResolvedValue({ ...mockUser, est_actif: true }),
    changeUserRole: jest.fn().mockResolvedValue({ ...mockUser, role: 'admin' }),
    hardDeleteUser: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UtilisateurController],
      providers: [{ provide: UtilisateurService, useValue: mockService }],
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
    mockService.create.mockResolvedValue(mockUser)
    mockService.findById.mockResolvedValue(mockUser)
    mockService.update.mockResolvedValue({ ...mockUser, nom: 'Durant' })
    mockService.remove.mockResolvedValue(undefined)
    mockService.validatePasswordForUser.mockResolvedValue(true)
    mockService.findAllForAdmin.mockResolvedValue([mockUser])
    mockService.deactivateUser.mockResolvedValue({ ...mockUser, est_actif: false })
    mockService.activateUser.mockResolvedValue({ ...mockUser, est_actif: true })
    mockService.changeUserRole.mockResolvedValue({ ...mockUser, role: 'admin' })
    mockService.hardDeleteUser.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await app.close()
  })

  // POST /utilisateurs
  it('POST /utilisateurs - creates a user and returns 201', () => {
    return request(app.getHttpServer())
      .post('/utilisateurs')
      .send({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@test.dev',
        mot_de_passe: 'Password123!',
      })
      .expect(HttpStatus.CREATED)
      .expect(mockUser)
  })

  it('POST /utilisateurs - returns 400 on missing required fields', () => {
    return request(app.getHttpServer())
      .post('/utilisateurs')
      .send({ nom: 'Dupont' })
      .expect(HttpStatus.BAD_REQUEST)
  })

  // GET /utilisateurs/:id
  it('GET /utilisateurs/:id - returns user by id', () => {
    return request(app.getHttpServer())
      .get(`/utilisateurs/${USER_ID}`)
      .expect(HttpStatus.OK)
      .expect(mockUser)
  })

  // PATCH /utilisateurs/:id
  it('PATCH /utilisateurs/:id - updates and returns user', () => {
    return request(app.getHttpServer())
      .patch(`/utilisateurs/${USER_ID}`)
      .send({ nom: 'Durant' })
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, nom: 'Durant' })
  })

  // DELETE /utilisateurs/:id
  it('DELETE /utilisateurs/:id - removes user and returns 204', () => {
    return request(app.getHttpServer())
      .delete(`/utilisateurs/${USER_ID}`)
      .expect(HttpStatus.NO_CONTENT)
  })

  // POST /utilisateurs/:id/validate-password
  it('POST /utilisateurs/:id/validate-password - returns password validation result', () => {
    return request(app.getHttpServer())
      .post(`/utilisateurs/${USER_ID}/validate-password`)
      .send({ password: 'Password123!' })
      .expect(HttpStatus.OK)
      .expect({ isValid: true })
  })

  // GET /utilisateurs/admin/all
  it('GET /utilisateurs/admin/all - returns all users for admin', () => {
    return request(app.getHttpServer())
      .get('/utilisateurs/admin/all')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect([mockUser])
  })

  // PATCH /utilisateurs/admin/:id/deactivate
  it('PATCH /utilisateurs/admin/:id/deactivate - deactivates user', () => {
    return request(app.getHttpServer())
      .patch(`/utilisateurs/admin/${USER_ID}/deactivate`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, est_actif: false })
  })

  // PATCH /utilisateurs/admin/:id/activate
  it('PATCH /utilisateurs/admin/:id/activate - activates user', () => {
    return request(app.getHttpServer())
      .patch(`/utilisateurs/admin/${USER_ID}/activate`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, est_actif: true })
  })

  // PATCH /utilisateurs/admin/:id/role
  it('PATCH /utilisateurs/admin/:id/role - changes user role', () => {
    return request(app.getHttpServer())
      .patch(`/utilisateurs/admin/${USER_ID}/role`)
      .set('Authorization', 'Bearer jwt-token')
      .send({ role: 'admin' })
      .expect(HttpStatus.OK)
      .expect({ ...mockUser, role: 'admin' })
  })

  // DELETE /utilisateurs/admin/:id/hard-delete
  it('DELETE /utilisateurs/admin/:id/hard-delete - hard deletes user and returns 204', () => {
    return request(app.getHttpServer())
      .delete(`/utilisateurs/admin/${USER_ID}/hard-delete`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.NO_CONTENT)
  })
})
