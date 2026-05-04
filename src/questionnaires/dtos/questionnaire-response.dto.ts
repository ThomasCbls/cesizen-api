export class OptionResponseDto {
  id: string
  text: string
  score: number
}

export class QuestionResponseDto {
  id: string
  text: string
  order?: number
  options: OptionResponseDto[]
}

export class QuestionnaireResponseDto {
  id: string
  title: string
  description?: string
  category: string
  isActive: boolean
  questions?: QuestionResponseDto[]
  createdAt: Date
  updatedAt: Date
}
