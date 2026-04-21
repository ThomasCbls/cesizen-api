import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Utilisateur } from '../../utilisateurs/entities/utilisateur.entity'
import { Question } from './question.entity'

@Entity('questionnaire')
export class Questionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 50, default: 'STRESS' })
  category: string

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Utilisateur, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'createur_id' })
  createur: Utilisateur

  @Column({ type: 'uuid', nullable: true })
  createur_id: string

  @OneToMany(() => Question, (question) => question.questionnaire, {
    cascade: true,
  })
  questions: Question[]
}
