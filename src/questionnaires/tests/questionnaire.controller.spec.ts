import { Test, TestingModule } from '@nestjs/testing'
import { QuestionnaireController } from '../controllers/questionnaire.controller'
import { QuestionnaireService } from '../services/questionnaire.service'

describe('QuestionnaireController', () => {
  let controller: QuestionnaireController
  let service: QuestionnaireService

  const mockQuestionnaireList = {
    questionnaires: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Test Questionnaire',
        description: 'Test Description',
        category: 'STRESS',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    total: 1,
  }

  const mockQuestionnaireDetail = {
    questionnaire: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      title: 'Test Questionnaire',
      description: 'Test Description',
      category: 'STRESS',
      isActive: true,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }

  const mockQuestionnaireService = {
    getAllQuestionnaires: jest.fn().mockResolvedValue(mockQuestionnaireList),
    getQuestionnaireById: jest.fn().mockResolvedValue(mockQuestionnaireDetail),
    createQuestionnaire: jest.fn().mockResolvedValue(mockQuestionnaireDetail),
    updateQuestionnaire: jest.fn().mockResolvedValue(mockQuestionnaireDetail),
    deleteQuestionnaire: jest.fn().mockResolvedValue(void 0),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireController],
      providers: [
        {
          provide: QuestionnaireService,
          useValue: mockQuestionnaireService,
        },
      ],
    }).compile()

    controller = module.get<QuestionnaireController>(QuestionnaireController)
    service = module.get<QuestionnaireService>(QuestionnaireService)
  })

  describe('getAllQuestionnaires', () => {
    it('should return questionnaires with total', async () => {
      const result = await controller.getAllQuestionnaires('STRESS', 10)
      expect(result).toEqual(mockQuestionnaireList)
      expect(service.getAllQuestionnaires).toHaveBeenCalledWith({
        category: 'STRESS',
        limit: 10,
        page: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      })
    })
  })

  describe('getQuestionnaireById', () => {
    it('should return a questionnaire by id', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const result = await controller.getQuestionnaireById(id)
      expect(result).toEqual(mockQuestionnaireDetail)
      expect(service.getQuestionnaireById).toHaveBeenCalledWith(id)
    })
  })

  describe('createQuestionnaire', () => {
    it('should create and return a questionnaire', async () => {
      const createDto = {
        title: 'Test Questionnaire',
        description: 'Test Description',
        category: 'STRESS',
        questions: [
          {
            text: 'Question 1',
            order: 1,
            options: [
              { text: 'Oui', score: 10 },
              { text: 'Non', score: 0 },
            ],
          },
        ],
      }

      const result = await controller.createQuestionnaire(createDto)
      expect(result).toEqual(mockQuestionnaireDetail)
      expect(service.createQuestionnaire).toHaveBeenCalledWith(createDto)
    })
  })

  describe('updateQuestionnaire', () => {
    it('should update and return a questionnaire', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const updateDto = { title: 'Updated Questionnaire' }

      const result = await controller.updateQuestionnaire(id, updateDto)
      expect(result).toEqual(mockQuestionnaireDetail)
      expect(service.updateQuestionnaire).toHaveBeenCalledWith(id, updateDto)
    })
  })

  describe('deleteQuestionnaire', () => {
    it('should delete a questionnaire', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const result = await controller.deleteQuestionnaire(id)
      expect(result).toBeUndefined()
      expect(service.deleteQuestionnaire).toHaveBeenCalledWith(id)
    })
  })
})
