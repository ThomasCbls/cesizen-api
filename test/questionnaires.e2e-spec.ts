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
import { QuestionnaireController } from '../src/questionnaires/controllers/questionnaire.controller'
import { QuestionnaireService } from '../src/questionnaires/services/questionnaire.service'

const QUESTIONNAIRE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mockQuestionnaire = {
  id: QUESTIONNAIRE_ID,
  title: 'Echelle de Holmes et Rahe',
  description: 'Questionnaire de stress',
  category: 'STRESS',
  isActive: true,
  questions: [
    {
      id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
      text: 'Décès du conjoint',
      order: 1,
      options: [
        { id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', text: 'Oui', score: 100 },
        { id: 'd1b2c3d4-e5f6-7890-abcd-ef1234567890', text: 'Non', score: 0 },
      ],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockListResponse = { questionnaires: [mockQuestionnaire], total: 1 }
const mockDetailResponse = { questionnaire: mockQuestionnaire }

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

describe('Questionnaires (e2e)', () => {
  let app: INestApplication<App>

  const mockService = {
    getAllQuestionnaires: jest.fn().mockResolvedValue(mockListResponse),
    getQuestionnaireById: jest.fn().mockResolvedValue(mockDetailResponse),
    createQuestionnaire: jest.fn().mockResolvedValue(mockDetailResponse),
    updateQuestionnaire: jest.fn().mockResolvedValue(mockDetailResponse),
    deleteQuestionnaire: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireController],
      providers: [{ provide: QuestionnaireService, useValue: mockService }],
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
    mockService.getAllQuestionnaires.mockResolvedValue(mockListResponse)
    mockService.getQuestionnaireById.mockResolvedValue(mockDetailResponse)
    mockService.createQuestionnaire.mockResolvedValue(mockDetailResponse)
    mockService.updateQuestionnaire.mockResolvedValue(mockDetailResponse)
    mockService.deleteQuestionnaire.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await app.close()
  })

  // GET /questionnaires
  it('GET /questionnaires - returns list of questionnaires', () => {
    return request(app.getHttpServer())
      .get('/questionnaires')
      .expect(HttpStatus.OK)
      .expect(mockListResponse)
  })

  it('GET /questionnaires - filters by category query param', () => {
    return request(app.getHttpServer())
      .get('/questionnaires?category=STRESS&limit=5')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(mockService.getAllQuestionnaires).toHaveBeenCalledWith(
          expect.objectContaining({ category: 'STRESS', limit: 5 }),
        )
        expect(res.body).toEqual(mockListResponse)
      })
  })

  // GET /questionnaires/:id
  it('GET /questionnaires/:id - returns questionnaire detail', () => {
    return request(app.getHttpServer())
      .get(`/questionnaires/${QUESTIONNAIRE_ID}`)
      .expect(HttpStatus.OK)
      .expect(mockDetailResponse)
  })

  it('GET /questionnaires/:id - returns 400 for invalid UUID', () => {
    return request(app.getHttpServer())
      .get('/questionnaires/not-a-uuid')
      .expect(HttpStatus.BAD_REQUEST)
  })

  // POST /questionnaires
  it('POST /questionnaires - creates questionnaire and returns 201', () => {
    return request(app.getHttpServer())
      .post('/questionnaires')
      .set('Authorization', 'Bearer jwt-token')
      .send({ title: 'Echelle de Holmes et Rahe', description: 'Questionnaire de stress' })
      .expect(HttpStatus.CREATED)
      .expect(mockDetailResponse)
  })

  it('POST /questionnaires - returns 400 when title is missing', () => {
    return request(app.getHttpServer())
      .post('/questionnaires')
      .set('Authorization', 'Bearer jwt-token')
      .send({ description: 'No title' })
      .expect(HttpStatus.BAD_REQUEST)
  })

  // PUT /questionnaires/:id
  it('PUT /questionnaires/:id - updates questionnaire and returns 200', () => {
    return request(app.getHttpServer())
      .put(`/questionnaires/${QUESTIONNAIRE_ID}`)
      .set('Authorization', 'Bearer jwt-token')
      .send({ title: 'Updated Title' })
      .expect(HttpStatus.OK)
      .expect(mockDetailResponse)
  })

  it('PUT /questionnaires/:id - returns 400 for invalid UUID', () => {
    return request(app.getHttpServer())
      .put('/questionnaires/not-a-uuid')
      .set('Authorization', 'Bearer jwt-token')
      .send({ title: 'Updated Title' })
      .expect(HttpStatus.BAD_REQUEST)
  })

  // DELETE /questionnaires/:id
  it('DELETE /questionnaires/:id - deletes questionnaire and returns 204', () => {
    return request(app.getHttpServer())
      .delete(`/questionnaires/${QUESTIONNAIRE_ID}`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.NO_CONTENT)
  })

  it('DELETE /questionnaires/:id - returns 400 for invalid UUID', () => {
    return request(app.getHttpServer())
      .delete('/questionnaires/not-a-uuid')
      .set('Authorization', 'Bearer jwt-token')
      .expect(HttpStatus.BAD_REQUEST)
  })
})
