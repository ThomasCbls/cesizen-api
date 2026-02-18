import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UtilisateurRepository } from '../../utilisateurs/repositories/utilisateur.repository'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Questionnaire } from '../entities/questionnaire.entity'

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {}

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    try {
      return await this.questionnaireRepository.find({
        relations: ['createur'],
        order: { date_creation: 'DESC' },
      })
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des questionnaires')
    }
  }

  async getQuestionnaireById(id: number): Promise<Questionnaire> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID invalide')
    }

    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id_Questionnaire: id },
      relations: ['createur'],
    })

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire avec l'ID ${id} non trouvé`)
    }

    return questionnaire
  }

  async getQuestionnairesByCreateur(createur_id: number): Promise<Questionnaire[]> {
    if (!createur_id || createur_id <= 0) {
      throw new BadRequestException('ID créateur invalide')
    }

    const utilisateur = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: String(createur_id) },
    })

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${createur_id} non trouvé`)
    }

    return await this.questionnaireRepository.find({
      where: { createur_id },
      relations: ['createur'],
      order: { date_creation: 'DESC' },
    })
  }

  async createQuestionnaire(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const utilisateur = await this.utilisateurRepository.findOne({
      where: { id_utilisateur: String(createQuestionnaireDto.createur_id) },
    })

    if (!utilisateur) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${createQuestionnaireDto.createur_id} non trouvé`,
      )
    }

    const questionnaire = this.questionnaireRepository.create({
      nom: createQuestionnaireDto.nom,
      description: createQuestionnaireDto.description,
      createur_id: createQuestionnaireDto.createur_id,
    })

    return await this.questionnaireRepository.save(questionnaire)
  }

  async updateQuestionnaire(
    id: number,
    updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const questionnaire = await this.getQuestionnaireById(id)

    if (updateQuestionnaireDto.createur_id) {
      const utilisateur = await this.utilisateurRepository.findOne({
        where: { id_utilisateur: String(updateQuestionnaireDto.createur_id) },
      })

      if (!utilisateur) {
        throw new NotFoundException(
          `Utilisateur avec l'ID ${updateQuestionnaireDto.createur_id} non trouvé`,
        )
      }
    }

    Object.assign(questionnaire, updateQuestionnaireDto)
    return await this.questionnaireRepository.save(questionnaire)
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    const questionnaire = await this.getQuestionnaireById(id)
    await this.questionnaireRepository.remove(questionnaire)
  }
}
