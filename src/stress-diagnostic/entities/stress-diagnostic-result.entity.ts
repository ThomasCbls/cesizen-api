import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity'
import { Utilisateur } from '../../utilisateurs/entities/utilisateur.entity'
import { StressLevel } from '../enums/stress-level.enum'
import { StressDiagnosticAnswer } from './stress-diagnostic-answer.entity'

@Entity('stress_diagnostic_result')
export class StressDiagnosticResult {
  @PrimaryGeneratedColumn()
  id_diagnostic: number

  @ManyToOne(() => Questionnaire, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire

  @Column({ type: 'integer' })
  questionnaire_id: number

  @ManyToOne(() => Utilisateur, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur

  @Column({ type: 'uuid' })
  utilisateur_id: string

  @Column({ type: 'integer' })
  score_total: number

  @Column({ type: 'integer' })
  score_maximum: number

  @Column({
    type: 'enum',
    enum: StressLevel,
  })
  niveau_stress: StressLevel

  @Column({ type: 'text' })
  interpretation: string

  @CreateDateColumn()
  date_soumission: Date

  @OneToMany(() => StressDiagnosticAnswer, (answer) => answer.diagnostic, {
    cascade: true,
    eager: true,
  })
  answers: StressDiagnosticAnswer[]
}
