import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: "L'événement est obligatoire" })
  event: string

  @IsNumber()
  @IsNotEmpty({ message: 'Les points sont obligatoires' })
  points: number
}
