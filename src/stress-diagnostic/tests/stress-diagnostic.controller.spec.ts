import { Test, TestingModule } from '@nestjs/testing'
import { StressDiagnosticController } from '../controllers/stress-diagnostic.controller'
import { StressDiagnosticService } from '../services/stress-diagnostic.service'
import { StressLevel } from '../enums/stress-level.enum'

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

  const diagnostic = {
    id_diagnostic: 1,
    questionnaire_id: 1,
    questionnaire_nom: 'Diagnostic de stress CESIZen',
    utilisateur_id: currentUser.sub,
    score_total: 6,
    score_maximum: 12,
    niveau_stress: StressLevel.MODERATE,
    interpretation: 'Niveau de stress modéré.',
    date_soumission: new Date('2026-03-31T10:00:00.000Z'),
    answers: [],
  }

  const mockStressDiagnosticService = {
    submitDiagnostic: jest.fn().mockResolvedValue(diagnostic),
    getHistory: jest.fn().mockResolvedValue([diagnostic]),
    getDiagnosticById: jest.fn().mockResolvedValue(diagnostic),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StressDiagnosticController],
      providers: [
        {
          provide: StressDiagnosticService,
          useValue: mockStressDiagnosticService,
        },
      ],
    }).compile()

    controller = module.get<StressDiagnosticController>(StressDiagnosticController)
    service = module.get<StressDiagnosticService>(StressDiagnosticService)
    jest.clearAllMocks()
    mockStressDiagnosticService.submitDiagnostic.mockResolvedValue(diagnostic)
    mockStressDiagnosticService.getHistory.mockResolvedValue([diagnostic])
    mockStressDiagnosticService.getDiagnosticById.mockResolvedValue(diagnostic)
  })

  it('submits a diagnostic for the current user', async () => {
    const result = await controller.submitDiagnostic(
      1,
      {
        answers: [{ question_id: 1, event_id: 2 }],
      },
      currentUser,
    )

    expect(result).toEqual(diagnostic)
    expect(service.submitDiagnostic).toHaveBeenCalledWith(
      1,
      { answers: [{ question_id: 1, event_id: 2 }] },
      currentUser,
    )
  })

  it('returns the current user history', async () => {
    const result = await controller.getHistory(currentUser, {})

    expect(result).toEqual([diagnostic])
    expect(service.getHistory).toHaveBeenCalledWith(currentUser, {})
  })

  it('returns a diagnostic detail', async () => {
    const result = await controller.getDiagnosticById(1, currentUser)

    expect(result).toEqual(diagnostic)
    expect(service.getDiagnosticById).toHaveBeenCalledWith(1, currentUser)
  })
})
