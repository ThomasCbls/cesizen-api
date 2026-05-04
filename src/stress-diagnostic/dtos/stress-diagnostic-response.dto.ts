export class StressDiagnosticResultDto {
  totalScore: number
  maxScore: number
  percentage: number
  level: string
  interpretation: string
  recommendations: string[]
}

export class StressDiagnosticSubmitResponseDto {
  success: boolean
  diagnosticId: string
  result: StressDiagnosticResultDto
  submittedAt: Date
}

export class StressDiagnosticHistoryItemDto {
  id: string
  questionnaireId: string
  questionnaireTitle: string
  result: StressDiagnosticResultDto
  submittedAt: Date
}

export class StressDiagnosticHistoryResponseDto {
  diagnostics: StressDiagnosticHistoryItemDto[]
  total: number
  page: number
  limit: number
}
