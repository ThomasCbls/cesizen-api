import { IsBoolean, IsOptional, IsString, Length } from 'class-validator'

export class UpdateQuestionnaireDto {
  @IsString()
  @IsOptional()
  @Length(1, 255, { message: 'Le titre doit contenir entre 1 et 255 caractères' })
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
