import { Test, TestingModule } from '@nestjs/testing'
import { QuestionnaireController } from '../controllers/questionnaire.controller'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Questionnaire } from '../entities/questionnaire.entity'
import { QuestionnaireService } from '../services/questionnaire.service'

describe('QuestionnaireController', () => {
  let controller: QuestionnaireController
  let service: QuestionnaireService

  const mockUtilisateur = {
    id_utilisateur: 1,
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
  }

  const mockQuestionnaire: Questionnaire = {
    id_Questionnaire: 1,
    nom: 'Test Questionnaire',
    description: 'Test Description',
    date_creation: new Date(),
    createur_id: 1,
  }

  const mockQuestionnaireService = {
    getAllQuestionnaires: jest.fn().mockResolvedValue([mockQuestionnaire]),
    getQuestionnaireById: jest.fn().mockResolvedValue(mockQuestionnaire),
    getQuestionnairesByCreateur: jest.fn().mockResolvedValue([mockQuestionnaire]),
    createQuestionnaire: jest.fn().mockResolvedValue(mockQuestionnaire),
    updateQuestionnaire: jest.fn().mockResolvedValue(mockQuestionnaire),
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
    it('should return an array of questionnaires', async () => {
      const result = await controller.getAllQuestionnaires()
      expect(result).toEqual([mockQuestionnaire])
      expect(service.getAllQuestionnaires).toHaveBeenCalled()
    })
  })

  describe('getQuestionnaireById', () => {
    it('should return a questionnaire by id', async () => {
      const result = await controller.getQuestionnaireById(1)
      expect(result).toEqual(mockQuestionnaire)
      expect(service.getQuestionnaireById).toHaveBeenCalledWith(1)
    })
  })

  describe('getQuestionnairesByCreateur', () => {
    it('should return questionnaires by createur id', async () => {
      const result = await controller.getQuestionnairesByCreateur(1)
      expect(result).toEqual([mockQuestionnaire])
      expect(service.getQuestionnairesByCreateur).toHaveBeenCalledWith(1)
    })
  })

  describe('createQuestionnaire', () => {
    it('should create and return a questionnaire', async () => {
      const createDto: CreateQuestionnaireDto = {
        nom: 'Test Questionnaire',
        description: 'Test Description',
        createur_id: 1,
      }

      const result = await controller.createQuestionnaire(createDto)
      expect(result).toEqual(mockQuestionnaire)
      expect(service.createQuestionnaire).toHaveBeenCalledWith(createDto)
    })
  })

  describe('updateQuestionnaire', () => {
    it('should update and return a questionnaire', async () => {
      const updateDto: UpdateQuestionnaireDto = {
        nom: 'Updated Questionnaire',
      }

      const result = await controller.updateQuestionnaire(1, updateDto)
      expect(result).toEqual(mockQuestionnaire)
      expect(service.updateQuestionnaire).toHaveBeenCalledWith(1, updateDto)
    })
  })

  describe('deleteQuestionnaire', () => {
    it('should delete a questionnaire', async () => {
      const result = await controller.deleteQuestionnaire(1)
      expect(result).toBeUndefined()
      expect(service.deleteQuestionnaire).toHaveBeenCalledWith(1)
    })
  })
})
