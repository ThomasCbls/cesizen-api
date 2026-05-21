import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { PasswordHistory } from '../entities/password-history.entity'

@Injectable()
export class PasswordHistoryRepository extends Repository<PasswordHistory> {
  constructor(private dataSource: DataSource) {
    super(PasswordHistory, dataSource.createEntityManager())
  }

  /**
   * Récupère les N derniers mots de passe d'un utilisateur
   */
  async getRecentPasswordHashes(userId: string, limit: number = 5): Promise<PasswordHistory[]> {
    return this.find({
      where: { id_utilisateur: userId },
      order: { created_at: 'DESC' },
      take: limit,
    })
  }

  /**
   * Ajoute un mot de passe à l'historique
   */
  async addPasswordToHistory(userId: string, passwordHash: string): Promise<PasswordHistory> {
    const history = this.create({
      id_utilisateur: userId,
      mot_de_passe_hash: passwordHash,
    })
    return this.save(history)
  }

  /**
   * Nettoie l'historique en gardant les N derniers
   */
  async cleanOldPasswords(userId: string, keepCount: number = 12): Promise<void> {
    const allPasswords = await this.find({
      where: { id_utilisateur: userId },
      order: { created_at: 'DESC' },
    })

    if (allPasswords.length > keepCount) {
      const toDelete = allPasswords.slice(keepCount)
      await this.remove(toDelete)
    }
  }

  /**
   * Supprime tout l'historique d'un utilisateur
   */
  async deleteUserHistory(userId: string): Promise<void> {
    await this.delete({ id_utilisateur: userId })
  }
}
