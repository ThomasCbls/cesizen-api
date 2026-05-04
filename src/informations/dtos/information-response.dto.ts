export class InformationResponseDto {
  id_information: number
  titre: string
  contenu: string
  type_contenu: string
  slug?: string
  est_actif: boolean
  ordre_affichage: number
  date_creation: Date
  date_modification: Date

  constructor(partial: Partial<InformationResponseDto>) {
    Object.assign(this, partial)
  }
}
