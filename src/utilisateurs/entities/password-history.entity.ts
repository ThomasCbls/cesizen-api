import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Utilisateur } from './utilisateur.entity'

/**
 * Entité pour l'historique des mots de passe
 * Conforme aux recommandations ANSII : permet de vérifier qu'un nouveau mot de passe
 * n'a pas été utilisé récemment (généralement 5-12 derniers mots de passe)
 */
@Entity('password_history')
@Index(['id_utilisateur', 'created_at'])
export class PasswordHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  id_utilisateur: string

  @ManyToOne(() => Utilisateur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_utilisateur' })
  utilisateur: Utilisateur

  @Column({ type: 'varchar', length: 255 })
  mot_de_passe_hash: string

  @CreateDateColumn()
  created_at: Date
}
