import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateInformationDto } from '../dtos/create-information.dto'
import { UpdateInformationDto } from '../dtos/update-information.dto'
import { InformationResponseDto } from '../dtos/information-response.dto'
import { Information } from '../entities/information.entity'

@Injectable()
export class InformationService {
  constructor(
    @InjectRepository(Information)
    private readonly informationRepository: Repository<Information>,
  ) {}

  async findAll(): Promise<InformationResponseDto[]> {
    const informations = await this.informationRepository.find({
      where: { est_actif: true },
      order: { ordre_affichage: 'ASC', titre: 'ASC' },
    })
    return informations.map((info) => new InformationResponseDto(info))
  }

  async findByType(type: string): Promise<InformationResponseDto[]> {
    const informations = await this.informationRepository.find({
      where: { type_contenu: type, est_actif: true },
      order: { ordre_affichage: 'ASC', titre: 'ASC' },
    })
    return informations.map((info) => new InformationResponseDto(info))
  }

  async findBySlug(slug: string): Promise<InformationResponseDto> {
    const information = await this.informationRepository.findOne({
      where: { slug, est_actif: true },
    })
    if (!information) {
      throw new NotFoundException(`Information avec le slug '${slug}' introuvable`)
    }
    return new InformationResponseDto(information)
  }

  async findById(id: number): Promise<InformationResponseDto> {
    const information = await this.informationRepository.findOne({
      where: { id_information: id },
    })
    if (!information) {
      throw new NotFoundException(`Information avec l'ID ${id} introuvable`)
    }
    return new InformationResponseDto(information)
  }

  // Méthodes d'administration (réservées aux admins)
  async findAllForAdmin(): Promise<InformationResponseDto[]> {
    const informations = await this.informationRepository.find({
      order: { ordre_affichage: 'ASC', titre: 'ASC' },
    })
    return informations.map((info) => new InformationResponseDto(info))
  }

  async create(createInformationDto: CreateInformationDto): Promise<InformationResponseDto> {
    // Générer le slug si pas fourni
    if (!createInformationDto.slug && createInformationDto.titre) {
      createInformationDto.slug = this.generateSlug(createInformationDto.titre)
    }

    const information = this.informationRepository.create(createInformationDto)
    const savedInformation = await this.informationRepository.save(information)
    return new InformationResponseDto(savedInformation)
  }

  async update(
    id: number,
    updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    const information = await this.informationRepository.findOne({
      where: { id_information: id },
    })
    if (!information) {
      throw new NotFoundException(`Information avec l'ID ${id} introuvable`)
    }

    // Mettre à jour le slug si le titre change
    if (updateInformationDto.titre && !updateInformationDto.slug) {
      updateInformationDto.slug = this.generateSlug(updateInformationDto.titre)
    }

    Object.assign(information, updateInformationDto)
    const savedInformation = await this.informationRepository.save(information)
    return new InformationResponseDto(savedInformation)
  }

  async remove(id: number): Promise<void> {
    const result = await this.informationRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Information avec l'ID ${id} introuvable`)
    }
  }

  async deactivate(id: number): Promise<InformationResponseDto> {
    const information = await this.informationRepository.findOne({
      where: { id_information: id },
    })
    if (!information) {
      throw new NotFoundException(`Information avec l'ID ${id} introuvable`)
    }

    information.est_actif = false
    const savedInformation = await this.informationRepository.save(information)
    return new InformationResponseDto(savedInformation)
  }

  private generateSlug(titre: string): string {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Remplacer tirets multiples par un seul
  }
}
