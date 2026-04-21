import { IsInt, IsOptional, IsUUID, Min } from 'class-validator'

export class StressDiagnosticHistoryQueryDto {
  @IsOptional()
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  utilisateurId?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number
}
