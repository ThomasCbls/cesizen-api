import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UtilisateurRepository } from '../../utilisateurs/repositories/utilisateur.repository'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Questionnaire } from '../entities/questionnaire.entity'
import { QuestionnaireService } from '../services/questionnaire.service'

describe('QuestionnaireService', () => {
  let service: QuestionnaireService
  let repository: Repository<Questionnaire>
  let utilisateurRepository: UtilisateurRepository

  const mockUtilisateur = {
    id: 1,
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
  }

  const mockQuestionnaire: Questionnaire = {
    id_Questionnaire: 1,
    libelle: 'Test Questionnaire',
    description: 'Test Description',
    date_creation: new Date(),
    createur_id: 1,
    createur: mockUtilisateur,
  }

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  const mockUtilisateurRepository = {
    findOne: jest.fn(),
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
          provide: UtilisateurRepository,
          useValue: mockUtilisateurRepository,
        },
      ],
    }).compile()

    service = module.get<QuestionnaireService>(QuestionnaireService)
    repository = module.get<Repository<Questionnaire>>(getRepositoryToken(Questionnaire))
    utilisateurRepository = module.get<UtilisateurRepository>(UtilisateurRepository)
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
        relations: ['createur'],
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
      mockUtilisateurRepository.findOne.mockResolvedValue(mockUtilisateur)
      mockRepository.find.mockResolvedValue([mockQuestionnaire])

      const result = await service.getQuestionnairesByCreateur(1)

      expect(result).toEqual([mockQuestionnaire])
    })

    it('should throw NotFoundException when utilisateur not found', async () => {
      mockUtilisateurRepository.findOne.mockResolvedValue(null)

      await expect(service.getQuestionnairesByCreateur(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('createQuestionnaire', () => {
    it('should create and return a questionnaire', async () => {
      const createDto: CreateQuestionnaireDto = {
        libelle: 'Test Questionnaire',
        description: 'Test Description',
        createur_id: 1,
      }

      mockUtilisateurRepository.findOne.mockResolvedValue(mockUtilisateur)
      mockRepository.create.mockReturnValue(mockQuestionnaire)
      mockRepository.save.mockResolvedValue(mockQuestionnaire)

      const result = await service.createQuestionnaire(createDto)

      expect(result).toEqual(mockQuestionnaire)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should throw NotFoundException when utilisateur not found', async () => {
      const createDto: CreateQuestionnaireDto = {
        libelle: 'Test Questionnaire',
        description: 'Test Description',
        createur_id: 999,
      }

      mockUtilisateurRepository.findOne.mockResolvedValue(null)

      await expect(service.createQuestionnaire(createDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateQuestionnaire', () => {
    it('should update and return a questionnaire', async () => {
      const updateDto: UpdateQuestionnaireDto = {
        libelle: 'Updated Questionnaire',
      }

      mockRepository.findOne.mockResolvedValue(mockQuestionnaire)
      mockRepository.save.mockResolvedValue({
        ...mockQuestionnaire,
        ...updateDto,
      })

      const result = await service.updateQuestionnaire(1, updateDto)

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
