import { IsOptional, IsUUID } from 'class-validator'

export class StressDiagnosticHistoryQueryDto {
  @IsOptional()
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  utilisateurId?: string
}
