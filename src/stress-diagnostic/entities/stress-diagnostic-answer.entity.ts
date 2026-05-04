import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Option } from '../../questionnaires/entities/option.entity'
import { Question } from '../../questionnaires/entities/question.entity'
import { StressDiagnosticResult } from './stress-diagnostic-result.entity'

@Entity('stress_diagnostic_answer')
export class StressDiagnosticAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => StressDiagnosticResult, (diagnostic) => diagnostic.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'diagnostic_id' })
  diagnostic: StressDiagnosticResult

  @Column({ type: 'uuid' })
  diagnostic_id: string

  @ManyToOne(() => Question, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'question_id' })
  question: Question

  @Column({ type: 'uuid' })
  question_id: string

  @ManyToOne(() => Option, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'option_id' })
  option: Option

  @Column({ type: 'uuid' })
  option_id: string

  @Column({ type: 'integer' })
  score: number
}
