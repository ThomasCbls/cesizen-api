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
import { InformationController } from '../src/informations/controllers/information.controller'
import { InformationService } from '../src/informations/services/information.service'

const mockInfo = {
  id_information: 1,
  titre: 'Gérer le stress au travail',
  contenu: 'Voici quelques conseils pour gérer le stress au travail.',
  type_contenu: 'article',
  slug: 'gerer-le-stress-au-travail',
  est_actif: true,
  ordre_affichage: 1,
  date_creation: '2026-01-01T00:00:00.000Z',
  date_modification: '2026-01-01T00:00:00.000Z',
}

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: Record<string, string> }>()
    req.user = {
      sub: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
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

describe('Informations (e2e)', () => {
  let app: INestApplication<App>

  const mockService = {
    findAll: jest.fn().mockResolvedValue([mockInfo]),
    findByType: jest.fn().mockResolvedValue([mockInfo]),
    findBySlug: jest.fn().mockResolvedValue(mockInfo),
    findById: jest.fn().mockResolvedValue(mockInfo),
    findAllForAdmin: jest.fn().mockResolvedValue([mockInfo]),
    create: jest.fn().mockResolvedValue(mockInfo),
    update: jest.fn().mockResolvedValue({ ...mockInfo, titre: 'Titre modifié' }),
    deactivate: jest.fn().mockResolvedValue({ ...mockInfo, est_actif: false }),
    remove: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InformationController],
      providers: [{ provide: InformationService, useValue: mockService }],
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
    mockService.findAll.mockResolvedValue([mockInfo])
    mockService.findByType.mockResolvedValue([mockInfo])
    mockService.findBySlug.mockResolvedValue(mockInfo)
    mockService.findById.mockResolvedValue(mockInfo)
    mockService.findAllForAdmin.mockResolvedValue([mockInfo])
    mockService.create.mockResolvedValue(mockInfo)
    mockService.update.mockResolvedValue({ ...mockInfo, titre: 'Titre modifié' })
    mockService.deactivate.mockResolvedValue({ ...mockInfo, est_actif: false })
    mockService.remove.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await app.close()
  })

  // GET /informations
  it('GET /informations - returns all active informations', () => {
    return request(app.getHttpServer())
      .get('/informations')
      .expect(HttpStatus.OK)
      .expect([mockInfo])
  })

  it('GET /informations?type=article - filters by type', () => {
    return request(app.getHttpServer())
      .get('/informations?type=article')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(mockService.findByType).toHaveBeenCalledWith('article')
        expect(res.body).toEqual([mockInfo])
      })
  })

  // GET /informations/slug/:slug
  it('GET /informations/slug/:slug - returns information by slug', () => {
    return request(app.getHttpServer())
      .get('/informations/slug/gerer-le-stress-au-travail')
      .expect(HttpStatus.OK)
      .expect(mockInfo)
  })

  // GET /informations/:id
  it('GET /informations/:id - returns information by id', () => {
    return request(app.getHttpServer())
      .get('/informations/1')
      .expect(HttpStatus.OK)
      .expect(mockInfo)
  })

  it('GET /informations/:id - returns 400 for non-integer id', () => {
    return request(app.getHttpServer())
      .get('/informations/not-an-id')
      .expect(HttpStatus.BAD_REQUEST)
  })

  // GET /informations/admin/all
  it('GET /informations/admin/all - returns all informations including inactive', () => {
    return request(app.getHttpServer())
      .get('/informations/admin/all')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect([mockInfo])
  })

  // POST /informations
  it('POST /informations - creates information and returns 201', () => {
    return request(app.getHttpServer())
      .post('/informations')
      .set('Authorization', 'Bearer jwt-token')
      .send({
        titre: 'Gérer le stress au travail',
        contenu: 'Voici quelques conseils pour gérer le stress au travail.',
        type_contenu: 'article',
      })
      .expect(HttpStatus.CREATED)
      .expect(mockInfo)
  })

  it('POST /informations - returns 400 when required fields are missing', () => {
    return request(app.getHttpServer())
      .post('/informations')
      .set('Authorization', 'Bearer jwt-token')
      .send({ titre: 'Titre seul' })
      .expect(HttpStatus.BAD_REQUEST)
  })

  // PATCH /informations/:id
  it('PATCH /informations/:id - updates information and returns 200', () => {
    return request(app.getHttpServer())
      .patch('/informations/1')
      .set('Authorization', 'Bearer jwt-token')
      .send({ titre: 'Titre modifié' })
      .expect(HttpStatus.OK)
      .expect({ ...mockInfo, titre: 'Titre modifié' })
  })

  // PATCH /informations/:id/deactivate
  it('PATCH /informations/:id/deactivate - deactivates information', () => {
    return request(app.getHttpServer())
      .patch('/informations/1/deactivate')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.OK)
      .expect({ ...mockInfo, est_actif: false })
  })

  // DELETE /informations/:id
  it('DELETE /informations/:id - deletes information and returns 204', () => {
    return request(app.getHttpServer())
      .delete('/informations/1')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.NO_CONTENT)
  })
})
