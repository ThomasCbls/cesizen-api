import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Questionnaire } from './questionnaire.entity'

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn()
  id_Question: number

  @Column({ type: 'text' })
  question: string

  @Column({ type: 'integer', nullable: true })
  order: number

  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions, {
    onDelete: 'CASCADE',
  })
  questionnaire: Questionnaire
}
