import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'La question est obligatoire' })
  question: string

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'L’ordre doit être supérieur ou égal à 1' })
  order?: number
}
