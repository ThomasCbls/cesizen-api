import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity'
import { StressDiagnosticRepository } from '../repositories/stress-diagnostic.repository'
import { StressDiagnosticService } from '../services/stress-diagnostic.service'

describe('StressDiagnosticService', () => {
  let service: StressDiagnosticService

  const currentUser = {
    sub: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    email: 'user@test.dev',
    role: 'user',
    nom: 'Stress',
    prenom: 'Tester',
  }

  const adminUser = {
    ...currentUser,
    sub: 'd505fbc8-66c2-4b84-a36f-2c43da7df000',
    role: 'admin',
  }

  const questionnaire = {
    id: 'q-uuid-1',
    title: 'Echelle de Holmes et Rahe',
    description: 'Test questionnaire',
    category: 'STRESS',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: 'q1-uuid',
        text: 'Décès du conjoint',
        order: 1,
        options: [
          { id: 'o1-uuid', text: 'Oui, dans les 12 derniers mois', score: 100 },
          { id: 'o2-uuid', text: 'Non', score: 0 },
        ],
      },
      {
        id: 'q2-uuid',
        text: 'Divorce',
        order: 2,
        options: [
          { id: 'o3-uuid', text: 'Oui, dans les 12 derniers mois', score: 73 },
          { id: 'o4-uuid', text: 'Non', score: 0 },
        ],
      },
    ],
  }

  const mockQuestionnaireRepository = {
    findOne: jest.fn(),
  }

  const mockStressDiagnosticRepository = {
    createAndSave: jest.fn(),
    findByUtilisateurId: jest.fn(),
    findById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StressDiagnosticService,
        {
          provide: getRepositoryToken(Questionnaire),
          useValue: mockQuestionnaireRepository,
        },
        {
          provide: StressDiagnosticRepository,
          useValue: mockStressDiagnosticRepository,
        },
      ],
    }).compile()

    service = module.get<StressDiagnosticService>(StressDiagnosticService)
    jest.clearAllMocks()
  })

  it('creates a diagnostic result with score and interpretation', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(questionnaire)
    mockStressDiagnosticRepository.createAndSave.mockImplementation((payload) => ({
      id: 'diag-uuid-1',
      questionnaire,
      questionnaire_id: questionnaire.id,
      utilisateur_id: currentUser.sub,
      totalScore: payload.totalScore,
      maxScore: payload.maxScore,
      percentage: payload.percentage,
      level: payload.level,
      interpretation: payload.interpretation,
      recommendations: payload.recommendations,
      submittedAt: new Date('2026-03-31T10:00:00.000Z'),
      answers: [],
    }))

    const result = await service.submitDiagnostic(
      'q-uuid-1',
      {
        answers: [
          { questionId: 'q1-uuid', optionId: 'o1-uuid', score: 100 },
          { questionId: 'q2-uuid', optionId: 'o3-uuid', score: 73 },
        ],
      },
      currentUser,
    )

    expect(result.success).toBe(true)
    expect(result.result.totalScore).toBe(173)
    expect(result.result.maxScore).toBe(173)
    expect(result.result.level).toBe('MODERATE')
  })

  it('rejects duplicate answers for the same question', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(questionnaire)

    await expect(
      service.submitDiagnostic(
        'q-uuid-1',
        {
          answers: [
            { questionId: 'q1-uuid', optionId: 'o1-uuid', score: 100 },
            { questionId: 'q1-uuid', optionId: 'o2-uuid', score: 0 },
          ],
        },
        currentUser,
      ),
    ).rejects.toThrow(BadRequestException)
  })

  it('returns paginated history for the current user', async () => {
    mockStressDiagnosticRepository.findByUtilisateurId.mockResolvedValue({
      diagnostics: [
        {
          id: 'diag-uuid-1',
          questionnaire,
          questionnaire_id: questionnaire.id,
          utilisateur_id: currentUser.sub,
          totalScore: 100,
          maxScore: 173,
          percentage: 57.8,
          level: 'LOW',
          interpretation: 'Niveau faible',
          recommendations: [],
          submittedAt: new Date('2026-03-31T10:00:00.000Z'),
          answers: [],
        },
      ],
      total: 1,
    })

    const result = await service.getHistory(currentUser, {})

    expect(result.diagnostics).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('forbids reading another user history without admin role', async () => {
    await expect(
      service.getHistory(currentUser, {
        utilisateurId: adminUser.sub,
      }),
    ).rejects.toThrow(ForbiddenException)
  })

  it('returns a diagnostic detail for admins even if it belongs to another user', async () => {
    mockStressDiagnosticRepository.findById.mockResolvedValue({
      id: 'diag-uuid-1',
      questionnaire,
      questionnaire_id: questionnaire.id,
      utilisateur_id: currentUser.sub,
      totalScore: 100,
      maxScore: 173,
      percentage: 57.8,
      level: 'LOW',
      interpretation: 'Niveau faible',
      recommendations: [],
      submittedAt: new Date('2026-03-31T10:00:00.000Z'),
      answers: [],
    })

    const result = await service.getDiagnosticById('diag-uuid-1', adminUser)

    expect(result.id).toBe('diag-uuid-1')
  })

  it('throws NotFoundException when the diagnostic does not exist', async () => {
    mockStressDiagnosticRepository.findById.mockResolvedValue(null)

    await expect(
      service.getDiagnosticById('d505fbc8-66c2-4b84-a36f-2c43da7df000', currentUser),
    ).rejects.toThrow(NotFoundException)
  })
})
