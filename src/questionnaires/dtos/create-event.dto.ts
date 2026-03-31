import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: "L'événement est obligatoire" })
  event: string

  @IsNumber()
  @IsNotEmpty({ message: 'Les points sont obligatoires' })
  @Min(0, { message: 'Les points doivent être supérieurs ou égaux à 0' })
  points: number
}
