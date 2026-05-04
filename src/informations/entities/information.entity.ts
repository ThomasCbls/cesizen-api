import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('information')
export class Information {
  @PrimaryGeneratedColumn()
  id_information: number

  @Column({ type: 'varchar', length: 255 })
  titre: string

  @Column({ type: 'text' })
  contenu: string

  @Column({ type: 'varchar', length: 100 })
  type_contenu: string // 'page', 'menu', 'article', etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string // pour l'URL

  @Column({ type: 'boolean', default: true })
  est_actif: boolean

  @Column({ type: 'int', default: 0 })
  ordre_affichage: number

  @CreateDateColumn()
  date_creation: Date

  @UpdateDateColumn()
  date_modification: Date
}
