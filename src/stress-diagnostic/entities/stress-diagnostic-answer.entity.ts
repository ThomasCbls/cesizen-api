import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Event } from '../../questionnaires/entities/event.entity'
import { Question } from '../../questionnaires/entities/question.entity'
import { StressDiagnosticResult } from './stress-diagnostic-result.entity'

@Entity('stress_diagnostic_answer')
export class StressDiagnosticAnswer {
  @PrimaryGeneratedColumn()
  id_reponse: number

  @ManyToOne(() => StressDiagnosticResult, (diagnostic) => diagnostic.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'diagnostic_id' })
  diagnostic: StressDiagnosticResult

  @Column({ type: 'integer' })
  diagnostic_id: number

  @ManyToOne(() => Question, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'question_id' })
  question: Question

  @Column({ type: 'integer' })
  question_id: number

  @ManyToOne(() => Event, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'event_id' })
  event: Event

  @Column({ type: 'integer' })
  event_id: number

  @Column({ type: 'integer' })
  points_obtenus: number

  @Column({ type: 'text' })
  question_label: string

  @Column({ type: 'varchar', length: 255 })
  event_label: string
}
