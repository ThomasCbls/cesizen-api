import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UtilisateurRepository } from '../../utilisateurs/repositories/utilisateur.repository'
import { CreateQuestionnaireDto } from '../dtos/create-questionnaire.dto'
import { UpdateQuestionnaireDto } from '../dtos/update-questionnaire.dto'
import { Event } from '../entities/event.entity'
import { Question } from '../entities/question.entity'
import { Questionnaire } from '../entities/questionnaire.entity'

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {}

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    try {
      return await this.questionnaireRepository.find({
        relations: ['createur', 'events', 'questions'],
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
      relations: ['createur', 'events', 'questions'],
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
      relations: ['createur', 'events', 'questions'],
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
      type: createQuestionnaireDto.type || 'stress_diagnostic',
      createur_id: createQuestionnaireDto.createur_id,
      events: [],
      questions: [],
    })

    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire)

    // Create events if provided
    if (createQuestionnaireDto.events && createQuestionnaireDto.events.length > 0) {
      const events = createQuestionnaireDto.events.map((eventDto) =>
        this.eventRepository.create({
          event: eventDto.event,
          points: eventDto.points,
          questionnaire: savedQuestionnaire,
        }),
      )
      savedQuestionnaire.events = await this.eventRepository.save(events)
    }

    // Create questions if provided
    if (createQuestionnaireDto.questions && createQuestionnaireDto.questions.length > 0) {
      const questions = createQuestionnaireDto.questions.map((questionDto) =>
        this.questionRepository.create({
          question: questionDto.question,
          order: questionDto.order,
          questionnaire: savedQuestionnaire,
        }),
      )
      savedQuestionnaire.questions = await this.questionRepository.save(questions)
    }

    return savedQuestionnaire
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
