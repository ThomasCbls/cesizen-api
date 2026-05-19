import { IsNotEmpty, IsString } from 'class-validator'

export class ValidatePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string
}
