import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Option } from '../entities/option.entity'
import { Question } from '../entities/question.entity'
import { Questionnaire } from '../entities/questionnaire.entity'
import { QuestionnaireService } from '../services/questionnaire.service'

describe('QuestionnaireService', () => {
  let service: QuestionnaireService

  const mockQuestionnaire = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Test Questionnaire',
    description: 'Test Description',
    category: 'STRESS',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [
      {
        id: 'q1-uuid',
        text: 'Question 1',
        order: 1,
        options: [
          { id: 'o1-uuid', text: 'Oui', score: 10 },
          { id: 'o2-uuid', text: 'Non', score: 0 },
        ],
      },
    ],
  }

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockQuestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockOptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
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
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: getRepositoryToken(Option),
          useValue: mockOptionRepository,
        },
      ],
    }).compile()

    service = module.get<QuestionnaireService>(QuestionnaireService)
    jest.clearAllMocks()
  })

  describe('getAllQuestionnaires', () => {
    it('should return questionnaires with total', async () => {
      const mockQb = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockQuestionnaire]),
      }
      mockRepository.createQueryBuilder.mockReturnValue(mockQb)

      const result = await service.getAllQuestionnaires({ category: 'STRESS' })

      expect(result.questionnaires).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.questionnaires[0].title).toBe('Test Questionnaire')
    })
  })

  describe('getQuestionnaireById', () => {
    it('should return a questionnaire by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockQuestionnaire)

      const result = await service.getQuestionnaireById('a1b2c3d4-e5f6-7890-abcd-ef1234567890')

      expect(result.questionnaire.title).toBe('Test Questionnaire')
      expect(result.questionnaire.questions).toHaveLength(1)
      expect(result.questionnaire.questions[0].options).toHaveLength(2)
    })

    it('should throw NotFoundException when questionnaire not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(
        service.getQuestionnaireById('d505fbc8-66c2-4b84-a36f-2c43da7df000'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteQuestionnaire', () => {
    it('should delete a questionnaire', async () => {
      mockRepository.findOne.mockResolvedValue(mockQuestionnaire)
      mockRepository.remove.mockResolvedValue(mockQuestionnaire)

      await service.deleteQuestionnaire('a1b2c3d4-e5f6-7890-abcd-ef1234567890')

      expect(mockRepository.remove).toHaveBeenCalledWith(mockQuestionnaire)
    })

    it('should throw NotFoundException when questionnaire not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(
        service.deleteQuestionnaire('d505fbc8-66c2-4b84-a36f-2c43da7df000'),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
