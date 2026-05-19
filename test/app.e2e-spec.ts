import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppController } from '../src/app.controller'
import { AppService } from '../src/app.service'
import { AuthController } from '../src/auth/auth.controller'
import { AuthService } from '../src/auth/auth.service'
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard'
import { StressDiagnosticController } from '../src/stress-diagnostic/controllers/stress-diagnostic.controller'
import { StressDiagnosticService } from '../src/stress-diagnostic/services/stress-diagnostic.service'

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: Record<string, string> }>()
    request.user = {
      sub: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
      email: 'user@test.dev',
      role: 'user',
      nom: 'Stress',
      prenom: 'Tester',
    }
    return true
  }
}

describe('Auth & StressDiagnostic (e2e)', () => {
  let app: INestApplication<App>

  const currentUser = {
    sub: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    email: 'user@test.dev',
    role: 'user',
    nom: 'Stress',
    prenom: 'Tester',
  }

  const authLoginResponse = {
    access_token: 'jwt-token',
    user: {
      id: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
      email: 'user@test.dev',
      nom: 'Stress',
      prenom: 'Tester',
      role: 'user',
    },
  }

  const profileResponse = {
    id: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    email: 'user@test.dev',
    nom: 'Stress',
    prenom: 'Tester',
    role: 'user',
  }

  const refreshResponse = {
    access_token: 'new-jwt-token',
    user: {
      id: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
      email: 'user@test.dev',
      nom: 'Stress',
      prenom: 'Tester',
      role: 'user',
    },
  }

  const submitResponse = {
    success: true,
    diagnosticId: 'diag-uuid-1',
    result: {
      totalScore: 173,
      maxScore: 600,
      percentage: 28.8,
      level: 'MODERATE',
      interpretation: 'Niveau de stress modere.',
      recommendations: ['Pratiquez des exercices de respiration'],
    },
    submittedAt: '2026-03-31T10:00:00.000Z',
  }

  const historyResponse = {
    diagnostics: [
      {
        id: 'diag-uuid-1',
        questionnaireId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        questionnaireTitle: 'Echelle de Holmes et Rahe',
        result: submitResponse.result,
        submittedAt: '2026-03-31T10:00:00.000Z',
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  }

  const mockAuthService = {
    login: jest.fn().mockResolvedValue(authLoginResponse),
    getProfile: jest.fn().mockResolvedValue(profileResponse),
    refresh: jest.fn().mockResolvedValue(refreshResponse),
  }

  const mockStressDiagnosticService = {
    submitDiagnostic: jest.fn().mockResolvedValue(submitResponse),
    getHistory: jest.fn().mockResolvedValue(historyResponse),
    getDiagnosticById: jest.fn().mockResolvedValue(historyResponse.diagnostics[0]),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, AuthController, StressDiagnosticController],
      providers: [
        AppService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: StressDiagnosticService, useValue: mockStressDiagnosticService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)
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
    mockAuthService.login.mockResolvedValue(authLoginResponse)
    mockAuthService.getProfile.mockResolvedValue(profileResponse)
    mockAuthService.refresh.mockResolvedValue(refreshResponse)
    mockStressDiagnosticService.submitDiagnostic.mockResolvedValue(submitResponse)
    mockStressDiagnosticService.getHistory.mockResolvedValue(historyResponse)
    mockStressDiagnosticService.getDiagnosticById.mockResolvedValue(historyResponse.diagnostics[0])
  })

  afterEach(async () => {
    await app.close()
  })

  // ====== APP ======

  it('GET / - returns Hello World', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!')
  })

  // ====== AUTH ======

  it('POST /auth/login - returns access token on valid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.dev', password: 'Password123!' })
      .expect(200)
      .expect(authLoginResponse)
  })

  it('POST /auth/login - returns 400 on missing fields', () => {
    return request(app.getHttpServer()).post('/auth/login').send({}).expect(400)
  })

  it('GET /auth/profile - returns current user profile', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer jwt-token')
      .expect(200)
      .expect((res) => {
        expect(mockAuthService.getProfile).toHaveBeenCalledWith(
          expect.objectContaining({ sub: currentUser.sub }),
        )
        expect(res.body).toEqual(profileResponse)
      })
  })

  it('POST /auth/refresh - returns new access token', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', 'Bearer jwt-token')
      .expect(200)
      .expect((res) => {
        expect(mockAuthService.refresh).toHaveBeenCalledWith(
          expect.objectContaining({ sub: currentUser.sub }),
        )
        expect(res.body).toEqual(refreshResponse)
      })
  })

  it('POST /auth/logout - returns success', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer jwt-token')
      .expect(200)
      .expect({ success: true })
  })

  // ====== STRESS DIAGNOSTIC ======

  it('POST /stress-diagnostics/questionnaires/:id/submissions - returns 400 on invalid payload', () => {
    return request(app.getHttpServer())
      .post('/stress-diagnostics/questionnaires/not-a-uuid/submissions')
      .send({ answers: [], unexpected: true })
      .expect(400)
  })

  it('POST /stress-diagnostics/questionnaires/:id/submissions - submits successfully', () => {
    // Use proper v4 UUIDs (version nibble = 4, variant nibble in {8,9,a,b})
    const validQuestionnaireId = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890'
    return request(app.getHttpServer())
      .post(`/stress-diagnostics/questionnaires/${validQuestionnaireId}/submissions`)
      .set('Authorization', 'Bearer jwt-token')
      .send({
        answers: [
          {
            questionId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567891',
            optionId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567892',
          },
        ],
      })
      .expect(201)
      .expect(submitResponse)
  })

  it('GET /stress-diagnostics/history - returns history for current user', () => {
    return request(app.getHttpServer())
      .get('/stress-diagnostics/history')
      .set('Authorization', 'Bearer jwt-token')
      .expect(200)
      .expect(historyResponse)
  })

  it('GET /stress-diagnostics/history/:diagnosticId - returns single diagnostic', () => {
    const diagId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    return request(app.getHttpServer())
      .get(`/stress-diagnostics/history/${diagId}`)
      .set('Authorization', 'Bearer jwt-token')
      .expect(200)
      .expect(historyResponse.diagnostics[0])
  })
})
