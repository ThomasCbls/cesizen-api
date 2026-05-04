import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

@Entity('utilisateur')
@Index(['email'], { unique: true })
export class Utilisateur {
  @PrimaryGeneratedColumn('uuid')
  id_utilisateur: string

  @Column({ type: 'varchar', length: 100 })
  nom: string

  @Column({ type: 'varchar', length: 100 })
  prenom: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string

  @Column({ type: 'varchar', length: 255 })
  mot_de_passe: string

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role: string

  @Column({ type: 'boolean', default: true })
  est_actif: boolean

  @CreateDateColumn()
  date_inscription: Date
}
