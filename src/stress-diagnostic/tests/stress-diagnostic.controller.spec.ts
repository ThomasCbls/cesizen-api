import { Test, TestingModule } from '@nestjs/testing'
import { StressDiagnosticController } from '../controllers/stress-diagnostic.controller'
import { StressDiagnosticService } from '../services/stress-diagnostic.service'

describe('StressDiagnosticController', () => {
  let controller: StressDiagnosticController
  let service: StressDiagnosticService

  const currentUser = {
    sub: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    email: 'user@test.dev',
    role: 'user',
    nom: 'Stress',
    prenom: 'Tester',
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
    submittedAt: new Date('2026-03-31T10:00:00.000Z'),
  }

  const historyResponse = {
    diagnostics: [
      {
        id: 'diag-uuid-1',
        questionnaireId: 'q-uuid-1',
        questionnaireTitle: 'Echelle de Holmes et Rahe',
        result: submitResponse.result,
        submittedAt: new Date('2026-03-31T10:00:00.000Z'),
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  }

  const mockService = {
    submitDiagnostic: jest.fn().mockResolvedValue(submitResponse),
    getHistory: jest.fn().mockResolvedValue(historyResponse),
    getDiagnosticById: jest.fn().mockResolvedValue(historyResponse.diagnostics[0]),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StressDiagnosticController],
      providers: [
        {
          provide: StressDiagnosticService,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<StressDiagnosticController>(StressDiagnosticController)
    service = module.get<StressDiagnosticService>(StressDiagnosticService)
    jest.clearAllMocks()
    mockService.submitDiagnostic.mockResolvedValue(submitResponse)
    mockService.getHistory.mockResolvedValue(historyResponse)
    mockService.getDiagnosticById.mockResolvedValue(historyResponse.diagnostics[0])
  })

  it('submits a diagnostic for the current user', async () => {
    const questionnaireId = 'q-uuid-1'
    const body = {
      answers: [
        { questionId: 'q1-uuid', optionId: 'o1-uuid', score: 100 },
      ],
    }

    const result = await controller.submitDiagnostic(questionnaireId, body, currentUser)

    expect(result).toEqual(submitResponse)
    expect(service.submitDiagnostic).toHaveBeenCalledWith(questionnaireId, body, currentUser)
  })

  it('returns the current user history', async () => {
    const result = await controller.getHistory(currentUser, {})

    expect(result).toEqual(historyResponse)
    expect(service.getHistory).toHaveBeenCalledWith(currentUser, {})
  })

  it('returns a diagnostic detail', async () => {
    const diagId = 'diag-uuid-1'
    const result = await controller.getDiagnosticById(diagId, currentUser)

    expect(result).toEqual(historyResponse.diagnostics[0])
    expect(service.getDiagnosticById).toHaveBeenCalledWith(diagId, currentUser)
  })
})
