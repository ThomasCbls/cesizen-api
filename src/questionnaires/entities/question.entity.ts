import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Option } from './option.entity'
import { Questionnaire } from './questionnaire.entity'

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  text: string

  @Column({ type: 'integer', nullable: true })
  order: number

  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire

  @OneToMany(() => Option, (option) => option.question, {
    cascade: true,
    eager: true,
  })
  options: Option[]
}
