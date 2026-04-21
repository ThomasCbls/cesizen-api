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
import { StressDiagnosticAnswer } from './stress-diagnostic-answer.entity'

@Entity('stress_diagnostic_result')
export class StressDiagnosticResult {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Questionnaire, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire

  @Column({ type: 'uuid' })
  questionnaire_id: string

  @ManyToOne(() => Utilisateur, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur

  @Column({ type: 'uuid' })
  utilisateur_id: string

  @Column({ type: 'integer' })
  totalScore: number

  @Column({ type: 'integer' })
  maxScore: number

  @Column({ type: 'float' })
  percentage: number

  @Column({ type: 'varchar', length: 50 })
  level: string

  @Column({ type: 'text' })
  interpretation: string

  @Column({ type: 'simple-json', nullable: true })
  recommendations: string[]

  @CreateDateColumn()
  submittedAt: Date

  @OneToMany(() => StressDiagnosticAnswer, (answer) => answer.diagnostic, {
    cascade: true,
    eager: true,
  })
  answers: StressDiagnosticAnswer[]
}
