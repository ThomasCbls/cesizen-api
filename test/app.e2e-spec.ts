import { Test, TestingModule } from '@nestjs/testing'
import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
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

describe('AppController (e2e)', () => {
  let app: INestApplication<App>

  const authResponse = {
    success: true,
    accessToken: 'jwt-token',
    tokenType: 'Bearer',
    expiresIn: '1h',
    user: {
      id: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
      email: 'user@test.dev',
      nom: 'Stress',
      prenom: 'Tester',
      role: 'user',
    },
  }

  const diagnosticResponse = {
    id_diagnostic: 1,
    questionnaire_id: 1,
    questionnaire_nom: 'Diagnostic de stress CESIZen',
    utilisateur_id: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    score_total: 6,
    score_maximum: 12,
    niveau_stress: 'modere',
    interpretation: 'Niveau de stress modéré.',
    date_soumission: '2026-03-31T10:00:00.000Z',
    answers: [],
  }

  const mockAuthService = {
    login: jest.fn().mockResolvedValue(authResponse),
  }

  const mockStressDiagnosticService = {
    submitDiagnostic: jest.fn().mockResolvedValue(diagnosticResponse),
    getHistory: jest.fn().mockResolvedValue([diagnosticResponse]),
    getDiagnosticById: jest.fn().mockResolvedValue(diagnosticResponse),
  }

  beforeEach(async () => {
    const testingModuleBuilder = Test.createTestingModule({
      controllers: [AuthController, StressDiagnosticController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: StressDiagnosticService,
          useValue: mockStressDiagnosticService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)

    const moduleFixture: TestingModule = await testingModuleBuilder.compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.dev', password: 'Password123!' })
      .expect(200)
      .expect(authResponse)
  })

  it('/stress-diagnostics/questionnaires/:id/submissions (POST) validates payload', () => {
    return request(app.getHttpServer())
      .post('/stress-diagnostics/questionnaires/1/submissions')
      .send({ answers: [], unexpected: true })
      .expect(400)
  })

  it('/stress-diagnostics/history (GET)', () => {
    return request(app.getHttpServer())
      .get('/stress-diagnostics/history')
      .set('Authorization', 'Bearer jwt-token')
      .expect(200)
      .expect([diagnosticResponse])
  })
})
