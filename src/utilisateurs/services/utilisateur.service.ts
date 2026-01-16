import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from '../entities/utilisateur.entity';
import { UtilisateurRepository } from '../repositories/utilisateur.repository';
import { CreateUtilisateurDto } from '../dtos/create-utilisateur.dto';
import { UpdateUtilisateurDto } from '../dtos/update-utilisateur.dto';
import { UtilisateurResponseDto } from '../dtos/utilisateur-response.dto';

@Injectable()
export class UtilisateurService {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async create(createUtilisateurDto: CreateUtilisateurDto): Promise<UtilisateurResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUtilisateur = await this.utilisateurRepository.findByEmail(
      createUtilisateurDto.email,
    );

    if (existingUtilisateur) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.mot_de_passe, 10);

    // Créer le nouvel utilisateur
    const utilisateur = this.utilisateurRepository.create({
      ...createUtilisateurDto,
      mot_de_passe: hashedPassword,
      role: createUtilisateurDto.role || 'user',
    });

    const savedUtilisateur = await this.utilisateurRepository.save(utilisateur);
    return this.mapToResponseDto(savedUtilisateur);
  }

  async findAll(): Promise<UtilisateurResponseDto[]> {
    const utilisateurs = await this.utilisateurRepository.findAllActifs();
    return utilisateurs.map((u) => this.mapToResponseDto(u));
  }

  async findById(id: string): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id);

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return this.mapToResponseDto(utilisateur);
  }

  async update(id: string, updateUtilisateurDto: UpdateUtilisateurDto): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id);

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Si l'email change, vérifier qu'il n'existe pas déjà
    if (updateUtilisateurDto.email && updateUtilisateurDto.email !== utilisateur.email) {
      const existingUtilisateur = await this.utilisateurRepository.findByEmail(
        updateUtilisateurDto.email,
      );

      if (existingUtilisateur) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
    }

    // Si le mot de passe est fourni, le hasher
    if (updateUtilisateurDto.mot_de_passe) {
      updateUtilisateurDto.mot_de_passe = await bcrypt.hash(
        updateUtilisateurDto.mot_de_passe,
        10,
      );
    }

    Object.assign(utilisateur, updateUtilisateurDto);
    const updatedUtilisateur = await this.utilisateurRepository.save(utilisateur);

    return this.mapToResponseDto(updatedUtilisateur);
  }

  async remove(id: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.findById(id);

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Soft delete : marquer comme inactif
    utilisateur.est_actif = false;
    await this.utilisateurRepository.save(utilisateur);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findByEmail(email: string): Promise<UtilisateurResponseDto | null> {
    const utilisateur = await this.utilisateurRepository.findByEmail(email);
    return utilisateur ? this.mapToResponseDto(utilisateur) : null;
  }

  private mapToResponseDto(utilisateur: Utilisateur): UtilisateurResponseDto {
    const dto = new UtilisateurResponseDto(utilisateur);
    // Ne pas renvoyer le mot de passe
    delete (dto as any).mot_de_passe;
    return dto;
  }
}
