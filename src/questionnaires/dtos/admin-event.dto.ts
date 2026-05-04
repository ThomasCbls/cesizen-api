import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: "Le texte de l'événement est obligatoire" })
  event: string

  @IsInt({ message: 'Les points doivent être un nombre entier' })
  points: number
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Le texte de l'événement ne peut pas être vide" })
  event?: string

  @IsOptional()
  @IsInt({ message: 'Les points doivent être un nombre entier' })
  points?: number
}

export class UpdateEventScoreDto {
  @IsInt({ message: 'Les points doivent être un nombre entier' })
  points: number
}
