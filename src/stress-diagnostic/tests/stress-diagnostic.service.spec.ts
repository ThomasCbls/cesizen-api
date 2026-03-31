import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { QuestionnaireType } from '../../questionnaires/enums/questionnaire-type.enum'
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity'
import { StressLevel } from '../enums/stress-level.enum'
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

  const questionnaire: Questionnaire = {
    id_Questionnaire: 1,
    nom: 'Diagnostic de stress CESIZen',
    description: 'Questionnaire de référence',
    type: QuestionnaireType.STRESS_DIAGNOSTIC,
    date_creation: new Date(),
    createur_id: adminUser.sub,
    createur: undefined as never,
    events: [
      { id_Event: 1, event: 'Jamais', points: 0, questionnaire: undefined as never },
      { id_Event: 2, event: 'Parfois', points: 2, questionnaire: undefined as never },
      { id_Event: 3, event: 'Souvent', points: 4, questionnaire: undefined as never },
    ],
    questions: [
      { id_Question: 1, question: 'Je me sens tendu', order: 1, questionnaire: undefined as never },
      { id_Question: 2, question: 'Je dors mal', order: 2, questionnaire: undefined as never },
      {
        id_Question: 3,
        question: 'Je rumine mes tâches',
        order: 3,
        questionnaire: undefined as never,
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
      id_diagnostic: 10,
      questionnaire,
      questionnaire_id: questionnaire.id_Questionnaire,
      utilisateur: undefined,
      utilisateur_id: currentUser.sub,
      score_total: payload.score_total,
      score_maximum: payload.score_maximum,
      niveau_stress: payload.niveau_stress,
      interpretation: payload.interpretation,
      date_soumission: new Date('2026-03-31T10:00:00.000Z'),
      answers: payload.answers.map((answer, index) => ({
        id_reponse: index + 1,
        diagnostic: undefined,
        diagnostic_id: 10,
        question: answer.question,
        question_id: answer.question_id,
        event: answer.event,
        event_id: answer.event_id,
        points_obtenus: answer.points_obtenus,
        question_label: answer.question_label,
        event_label: answer.event_label,
      })),
    }))

    const result = await service.submitDiagnostic(
      1,
      {
        answers: [
          { question_id: 1, event_id: 2 },
          { question_id: 2, event_id: 3 },
          { question_id: 3, event_id: 3 },
        ],
      },
      currentUser,
    )

    expect(result.score_total).toBe(10)
    expect(result.score_maximum).toBe(12)
    expect(result.niveau_stress).toBe(StressLevel.HIGH)
    expect(result.answers).toHaveLength(3)
  })

  it('rejects duplicate or incomplete answers', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(questionnaire)

    await expect(
      service.submitDiagnostic(
        1,
        {
          answers: [
            { question_id: 1, event_id: 1 },
            { question_id: 1, event_id: 2 },
            { question_id: 3, event_id: 3 },
          ],
        },
        currentUser,
      ),
    ).rejects.toThrow(BadRequestException)
  })

  it('returns only the current user history unless admin asks for another user', async () => {
    mockStressDiagnosticRepository.findByUtilisateurId.mockResolvedValue([
      {
        id_diagnostic: 10,
        questionnaire,
        questionnaire_id: questionnaire.id_Questionnaire,
        utilisateur: undefined,
        utilisateur_id: currentUser.sub,
        score_total: 4,
        score_maximum: 12,
        niveau_stress: StressLevel.MODERATE,
        interpretation: 'Moderate',
        date_soumission: new Date('2026-03-31T10:00:00.000Z'),
        answers: [],
      },
    ])

    const result = await service.getHistory(currentUser, {})

    expect(result).toHaveLength(1)
    expect(mockStressDiagnosticRepository.findByUtilisateurId).toHaveBeenCalledWith(currentUser.sub)
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
      id_diagnostic: 10,
      questionnaire,
      questionnaire_id: questionnaire.id_Questionnaire,
      utilisateur: undefined,
      utilisateur_id: currentUser.sub,
      score_total: 4,
      score_maximum: 12,
      niveau_stress: StressLevel.MODERATE,
      interpretation: 'Moderate',
      date_soumission: new Date('2026-03-31T10:00:00.000Z'),
      answers: [],
    })

    const result = await service.getDiagnosticById(10, adminUser)

    expect(result.id_diagnostic).toBe(10)
  })

  it('throws NotFoundException when the diagnostic does not exist', async () => {
    mockStressDiagnosticRepository.findById.mockResolvedValue(null)

    await expect(service.getDiagnosticById(404, currentUser)).rejects.toThrow(NotFoundException)
  })
})
