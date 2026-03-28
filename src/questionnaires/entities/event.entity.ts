import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Questionnaire } from './questionnaire.entity'

@Entity('event')
export class Event {
  @PrimaryGeneratedColumn()
  id_Event: number

  @Column({ type: 'varchar', length: 255 })
  event: string

  @Column({ type: 'integer' })
  points: number

  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.events, {
    onDelete: 'CASCADE',
  })
  questionnaire: Questionnaire
}
