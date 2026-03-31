import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UtilisateurRepository } from '../../utilisateurs/repositories/utilisateur.repository'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Event } from '../entities/event.entity'
import { Question } from '../entities/question.entity'
import { Questionnaire } from '../entities/questionnaire.entity'
import { QuestionnaireType } from '../enums/questionnaire-type.enum'
import { QuestionnaireService } from '../services/questionnaire.service'

describe('QuestionnaireService', () => {
  let service: QuestionnaireService

  const mockUtilisateur = {
    id_utilisateur: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
  }

  const mockQuestionnaire: Questionnaire = {
    id_Questionnaire: 1,
    nom: 'Test Questionnaire',
    description: 'Test Description',
    type: QuestionnaireType.STRESS_DIAGNOSTIC,
    date_creation: new Date(),
    createur_id: mockUtilisateur.id_utilisateur,
    createur: mockUtilisateur,
    events: [
      { id_Event: 2, event: 'Souvent', points: 3, questionnaire: undefined as never },
      { id_Event: 1, event: 'Jamais', points: 0, questionnaire: undefined as never },
    ],
    questions: [
      { id_Question: 2, question: 'Question 2', order: 2, questionnaire: undefined as never },
      { id_Question: 1, question: 'Question 1', order: 1, questionnaire: undefined as never },
    ],
  }

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockQuestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockUtilisateurRepository = {
    findById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnaireService,
        {
          provide: getRepositoryToken(Questionnaire),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: UtilisateurRepository,
          useValue: mockUtilisateurRepository,
        },
      ],
    }).compile()

    service = module.get<QuestionnaireService>(QuestionnaireService)
    jest.clearAllMocks()
  })

  describe('getAllQuestionnaires', () => {
    it('should return an array of questionnaires', async () => {
      mockRepository.find.mockResolvedValue([mockQuestionnaire])

      const result = await service.getAllQuestionnaires()

      expect(result).toEqual([mockQuestionnaire])
      expect(mockRepository.find).toHaveBeenCalled()
    })

    it('should throw BadRequestException on error', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'))

      await expect(service.getAllQuestionnaires()).rejects.toThrow(BadRequestException)
    })
  })

  describe('getQuestionnaireById', () => {
    it('should return a questionnaire by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockQuestionnaire)

      const result = await service.getQuestionnaireById(1)

      expect(result).toEqual(mockQuestionnaire)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id_Questionnaire: 1 },
        relations: ['createur', 'events', 'questions'],
      })
    })

    it('should throw NotFoundException when questionnaire not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.getQuestionnaireById(999)).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getQuestionnaireById(0)).rejects.toThrow(BadRequestException)
    })
  })

  describe('getQuestionnairesByCreateur', () => {
    it('should return questionnaires by createur id', async () => {
      mockUtilisateurRepository.findById.mockResolvedValue(mockUtilisateur)
      mockRepository.find.mockResolvedValue([mockQuestionnaire])

      const result = await service.getQuestionnairesByCreateur(mockUtilisateur.id_utilisateur)

      expect(result).toEqual([mockQuestionnaire])
    })

    it('should throw NotFoundException when utilisateur not found', async () => {
      mockUtilisateurRepository.findById.mockResolvedValue(null)

      await expect(
        service.getQuestionnairesByCreateur('d505fbc8-66c2-4b84-a36f-2c43da7df000'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('createQuestionnaire', () => {
    it('should create and return a questionnaire', async () => {
      const createDto: CreateQuestionnaireDto = {
        nom: 'Test Questionnaire',
        description: 'Test Description',
        type: QuestionnaireType.STRESS_DIAGNOSTIC,
        createur_id: mockUtilisateur.id_utilisateur,
        events: [
          { event: 'Jamais', points: 0 },
          { event: 'Souvent', points: 3 },
        ],
        questions: [
          { question: 'Question 1', order: 1 },
          { question: 'Question 2', order: 2 },
        ],
      }

      mockUtilisateurRepository.findById.mockResolvedValue(mockUtilisateur)
      mockRepository.create.mockReturnValue({ ...mockQuestionnaire, events: [], questions: [] })
      mockRepository.save.mockResolvedValue({ ...mockQuestionnaire, events: [], questions: [] })
      mockEventRepository.create.mockImplementation((value) => value)
      mockEventRepository.save.mockResolvedValue(mockQuestionnaire.events)
      mockQuestionRepository.create.mockImplementation((value) => value)
      mockQuestionRepository.save.mockResolvedValue(mockQuestionnaire.questions)

      const result = await service.createQuestionnaire(createDto)

      expect(result).toEqual(mockQuestionnaire)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should reject a stress questionnaire without answer levels', async () => {
      mockUtilisateurRepository.findById.mockResolvedValue(mockUtilisateur)

      await expect(
        service.createQuestionnaire({
          nom: 'Test Questionnaire',
          createur_id: mockUtilisateur.id_utilisateur,
          events: [{ event: 'Jamais', points: 0 }],
          questions: [{ question: 'Question 1', order: 1 }],
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException when utilisateur not found', async () => {
      const createDto: CreateQuestionnaireDto = {
        nom: 'Test Questionnaire',
        description: 'Test Description',
        type: QuestionnaireType.STRESS_DIAGNOSTIC,
        createur_id: 'd505fbc8-66c2-4b84-a36f-2c43da7df000',
        events: [
          { event: 'Jamais', points: 0 },
          { event: 'Souvent', points: 3 },
        ],
        questions: [{ question: 'Question 1', order: 1 }],
      }

      mockUtilisateurRepository.findById.mockResolvedValue(null)

      await expect(service.createQuestionnaire(createDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateQuestionnaire', () => {
    it('should update and return a questionnaire', async () => {
      const updateDto: UpdateQuestionnaireDto = {
        nom: 'Updated Questionnaire',
      }

      mockRepository.findOne.mockResolvedValue(mockQuestionnaire)
      mockRepository.save.mockResolvedValue({
        ...mockQuestionnaire,
        ...updateDto,
      })

      const result = await service.updateQuestionnaire(1, updateDto)

      expect(result.nom).toBe('Updated Questionnaire')
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })

  describe('deleteQuestionnaire', () => {
    it('should delete a questionnaire', async () => {
      mockRepository.findOne.mockResolvedValue(mockQuestionnaire)
      mockRepository.remove.mockResolvedValue(mockQuestionnaire)

      await service.deleteQuestionnaire(1)

      expect(mockRepository.remove).toHaveBeenCalledWith(mockQuestionnaire)
    })

    it('should throw NotFoundException when questionnaire not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.deleteQuestionnaire(999)).rejects.toThrow(NotFoundException)
    })
  })
})
