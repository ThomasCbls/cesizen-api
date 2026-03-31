import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Utilisateur } from '../../utilisateurs/entities/utilisateur.entity'
import { QuestionnaireType } from '../enums/questionnaire-type.enum'
import { Event } from './event.entity'
import { Question } from './question.entity'

@Entity('questionnaire')
export class Questionnaire {
  @PrimaryGeneratedColumn()
  id_Questionnaire: number

  @Column({ type: 'varchar', length: 255 })
  nom: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 50, default: 'stress_diagnostic' })
  type: QuestionnaireType

  @CreateDateColumn()
  date_creation: Date

  @ManyToOne(() => Utilisateur, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'createur_id' })
  createur: Utilisateur

  @Column({ type: 'uuid', nullable: false })
  createur_id: string

  @OneToMany(() => Event, (event) => event.questionnaire, {
    cascade: true,
    eager: true,
  })
  events: Event[]

  @OneToMany(() => Question, (question) => question.questionnaire, {
    cascade: true,
    eager: true,
  })
  questions: Question[]
}
