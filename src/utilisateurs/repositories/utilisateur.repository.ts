import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Utilisateur } from '../entities/utilisateur.entity'

@Injectable()
export class UtilisateurRepository extends Repository<Utilisateur> {
  constructor(private dataSource: DataSource) {
    super(Utilisateur, dataSource.createEntityManager())
  }

  async findByEmail(email: string): Promise<Utilisateur | null> {
    return this.findOne({
      where: { email },
    })
  }

  // async findAllActifs(): Promise<Utilisateur[]> {
  //   return this.find({
  //     // where: { est_actif: true },
  //     order: { date_inscription: 'DESC' },
  //   });
  // }

  // async findByRole(role: string): Promise<Utilisateur[]> {
  //   return this.find({
  //     where: { role, est_actif: true },
  //     order: { date_inscription: 'DESC' },
  //   });
  // }

  async findById(id: string): Promise<Utilisateur | null> {
    return this.findOne({
      where: { id_utilisateur: id },
    })
  }
}
