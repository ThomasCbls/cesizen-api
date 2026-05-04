import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * @deprecated This entity is no longer used. Replaced by Option entity.
 */
@Entity('event')
export class Event {
  @PrimaryGeneratedColumn()
  id_Event: number

  @Column({ type: 'varchar', length: 255 })
  event: string

  @Column({ type: 'integer' })
  points: number
}
