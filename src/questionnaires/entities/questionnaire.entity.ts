import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Utilisateur } from '../../utilisateurs/entities/utilisateur.entity'

@Entity('questionnaire')
export class Questionnaire {
  @PrimaryGeneratedColumn()
  id_Questionnaire: number

  @Column({ type: 'varchar', length: 255 })
  nom: string

  @Column({ type: 'text', nullable: true })
  description: string

  @CreateDateColumn()
  date_creation: Date

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.id_utilisateur, {
    eager: true,
    onDelete: 'CASCADE',
  })
  // @JoinColumn({ name: 'createur_id' })
  // createur: Utilisateur
  @Column({ nullable: false })
  createur_id: number
}
