export class UtilisateurResponseDto {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  date_inscription: Date;
  date_modification: Date;
  est_actif: boolean;

  constructor(partial: Partial<UtilisateurResponseDto>) {
    Object.assign(this, partial);
  }
}
