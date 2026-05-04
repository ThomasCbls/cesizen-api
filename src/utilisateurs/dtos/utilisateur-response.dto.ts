export class UtilisateurResponseDto {
  id_utilisateur: string
  nom: string
  prenom: string
  email: string
  role: string
  est_actif: boolean
  date_inscription: Date
  mot_de_passe?: string

  constructor(partial: Partial<UtilisateurResponseDto>) {
    Object.assign(this, partial)
  }
}
