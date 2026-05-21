import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PasswordValidatorService } from '../../auth/validators/password-validator.service'
import { CreateUtilisateurDto } from '../dtos/create-utilisateur.dto'
import { UpdateUtilisateurDto } from '../dtos/update-utilisateur.dto'
import { UtilisateurResponseDto } from '../dtos/utilisateur-response.dto'
import { Utilisateur } from '../entities/utilisateur.entity'
import { PasswordHistoryRepository } from '../repositories/password-history.repository'
import { UtilisateurRepository } from '../repositories/utilisateur.repository'

/**
 * Service pour la gestion des utilisateurs
 * Conforme aux recommandations ANSII pour la sécurité des mots de passe
 */
@Injectable()
export class UtilisateurService {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private passwordHistoryRepository: PasswordHistoryRepository,
    private passwordValidator: PasswordValidatorService,
  ) {}

  async create(createUtilisateurDto: CreateUtilisateurDto): Promise<UtilisateurResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUtilisateur = await this.utilisateurRepository.findByEmail(
      createUtilisateurDto.email,
    )

    if (existingUtilisateur) {
      throw new BadRequestException('Cet email est déjà utilisé')
    }

    // Valider le mot de passe selon les recommandations ANSII
    const passwordValidation = this.passwordValidator.validatePassword(
      createUtilisateurDto.mot_de_passe,
    )
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '))
    }

    // Hasher le mot de passe (bcrypt avec salt rounds = 12 pour meilleure sécurité)
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.mot_de_passe, 12)

    // Créer le nouvel utilisateur
    const utilisateur = this.utilisateurRepository.create({
      ...createUtilisateurDto,
      mot_de_passe: hashedPassword,
      role: createUtilisateurDto.role || 'user',
    })

    const savedUtilisateur = await this.utilisateurRepository.save(utilisateur)

    // Ajouter le mot de passe à l'historique
    await this.passwordHistoryRepository.addPasswordToHistory(
      savedUtilisateur.id_utilisateur,
      hashedPassword,
    )

    return this.mapToResponseDto(savedUtilisateur)
  }

  // async findAll(): Promise<UtilisateurResponseDto[]> {
  //   const utilisateurs = await this.utilisateurRepository.findAllActifs();
  //   return utilisateurs.map((u) => this.mapToResponseDto(u));
  // }

  // Méthodes d'administration (réservées aux admins)
  async findAllForAdmin(): Promise<UtilisateurResponseDto[]> {
    const utilisateurs = await this.utilisateurRepository.findAll()
    return utilisateurs.map((u) => this.mapToResponseDto(u))
  }

  async deactivateUser(id: string): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    utilisateur.est_actif = false
    const updatedUtilisateur = await this.utilisateurRepository.save(utilisateur)
    return this.mapToResponseDto(updatedUtilisateur)
  }

  async activateUser(id: string): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    utilisateur.est_actif = true
    const updatedUtilisateur = await this.utilisateurRepository.save(utilisateur)
    return this.mapToResponseDto(updatedUtilisateur)
  }

  async changeUserRole(id: string, newRole: string): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Validation du rôle
    const validRoles = ['user', 'admin']
    if (!validRoles.includes(newRole)) {
      throw new BadRequestException(`Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}`)
    }

    utilisateur.role = newRole
    const updatedUtilisateur = await this.utilisateurRepository.save(utilisateur)
    return this.mapToResponseDto(updatedUtilisateur)
  }

  async hardDeleteUser(id: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Supprimer l'historique des mots de passe
    await this.passwordHistoryRepository.deleteUserHistory(id)

    await this.utilisateurRepository.remove(utilisateur)
  }

  async findById(id: string): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    return this.mapToResponseDto(utilisateur)
  }

  async update(
    id: string,
    updateUtilisateurDto: UpdateUtilisateurDto,
  ): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Si l'email change, vérifier qu'il n'existe pas déjà
    if (updateUtilisateurDto.email && updateUtilisateurDto.email !== utilisateur.email) {
      const existingUtilisateur = await this.utilisateurRepository.findByEmail(
        updateUtilisateurDto.email,
      )

      if (existingUtilisateur) {
        throw new BadRequestException('Cet email est déjà utilisé')
      }
    }

    // Si le mot de passe est fourni, le hasher avec vérification ANSII
    if (updateUtilisateurDto.mot_de_passe) {
      // Valider le mot de passe selon les recommandations ANSII
      const passwordValidation = this.passwordValidator.validatePassword(
        updateUtilisateurDto.mot_de_passe,
      )
      if (!passwordValidation.isValid) {
        throw new BadRequestException(passwordValidation.errors.join(', '))
      }

      // Vérifier que le nouveau mot de passe n'a pas été utilisé récemment
      const recentPasswords = await this.passwordHistoryRepository.getRecentPasswordHashes(id, 5)
      for (const history of recentPasswords) {
        const isReused = await bcrypt.compare(
          updateUtilisateurDto.mot_de_passe,
          history.mot_de_passe_hash,
        )
        if (isReused) {
          throw new BadRequestException('Ce mot de passe a déjà été utilisé')
        }
      }

      // Hasher le nouveau mot de passe
      const newHashedPassword = await bcrypt.hash(updateUtilisateurDto.mot_de_passe, 12)
      updateUtilisateurDto.mot_de_passe = newHashedPassword

      // Ajouter le ancien mot de passe à l'historique avant de le remplacer
      if (utilisateur.mot_de_passe) {
        await this.passwordHistoryRepository.addPasswordToHistory(id, utilisateur.mot_de_passe)
      }

      // Nettoyer l'historique en gardant les 12 derniers mots de passe
      await this.passwordHistoryRepository.cleanOldPasswords(id, 12)
    }

    Object.assign(utilisateur, updateUtilisateurDto)
    const updatedUtilisateur = await this.utilisateurRepository.save(utilisateur)

    return this.mapToResponseDto(updatedUtilisateur)
  }

  async remove(id: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Soft delete : marquer comme inactif
    // utilisateur.est_actif = false;
    await this.utilisateurRepository.save(utilisateur)
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  async validatePasswordForUser(id: string, password: string): Promise<boolean> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    return await this.validatePassword(password, utilisateur.mot_de_passe)
  }

  async findByEmail(email: string): Promise<UtilisateurResponseDto | null> {
    const utilisateur = await this.utilisateurRepository.findByEmail(email)
    return utilisateur ? this.mapToResponseDto(utilisateur) : null
  }

  async findByEmailWithPassword(email: string): Promise<Utilisateur | null> {
    return await this.utilisateurRepository.findByEmail(email)
  }

  private mapToResponseDto(utilisateur: Utilisateur): UtilisateurResponseDto {
    const dto = new UtilisateurResponseDto(utilisateur)
    // Ne pas renvoyer le mot de passe
    delete (dto as any).mot_de_passe
    return dto
  }

  /**
   * Change le mot de passe d'un utilisateur de manière sécurisée
   * Vérifie l'ancien mot de passe avant de permettre le changement
   * Conforme aux recommandations ANSII
   */
  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<UtilisateurResponseDto> {
    const utilisateur = await this.utilisateurRepository.findById(id)

    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await this.validatePassword(oldPassword, utilisateur.mot_de_passe)
    if (!isOldPasswordValid) {
      throw new UnauthorizedException("L'ancien mot de passe est incorrect")
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (oldPassword === newPassword) {
      throw new BadRequestException('Le mot de passe doit être différent du précédent')
    }

    // Valider le nouveau mot de passe selon les recommandations ANSII
    const passwordValidation = this.passwordValidator.validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '))
    }

    // Vérifier que le nouveau mot de passe n'a pas été utilisé récemment
    const recentPasswords = await this.passwordHistoryRepository.getRecentPasswordHashes(id, 5)
    for (const history of recentPasswords) {
      const isReused = await bcrypt.compare(newPassword, history.mot_de_passe_hash)
      if (isReused) {
        throw new BadRequestException('Ce mot de passe a déjà été utilisé')
      }
    }

    // Ajouter l'ancien mot de passe à l'historique
    await this.passwordHistoryRepository.addPasswordToHistory(id, utilisateur.mot_de_passe)

    // Hasher et mettre à jour le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    utilisateur.mot_de_passe = hashedPassword

    const updatedUtilisateur = await this.utilisateurRepository.save(utilisateur)

    // Nettoyer l'historique en gardant les 12 derniers mots de passe
    await this.passwordHistoryRepository.cleanOldPasswords(id, 12)

    return this.mapToResponseDto(updatedUtilisateur)
  }

  /**
   * Génère un mot de passe robuste recommandé selon l'ANSII
   */
  generateStrongPassword(): string {
    return this.passwordValidator.generateStrongPassword()
  }
}
