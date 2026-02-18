import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator'

export class CreateQuestionnaireDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @Length(1, 255, { message: 'Le nom doit contenir entre 1 et 255 caractères' })
  nom: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsNotEmpty({ message: "L'ID du créateur est obligatoire" })
  createur_id: number
}
