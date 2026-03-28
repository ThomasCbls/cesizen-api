import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'La question est obligatoire' })
  question: string

  @IsNumber()
  @IsOptional()
  order?: number
}
