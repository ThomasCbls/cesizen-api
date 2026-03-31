import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'
import { StressDiagnosticHistoryQueryDto } from '../dtos/stress-diagnostic-history-query.dto'
import { SubmitStressDiagnosticDto } from '../dtos/submit-stress-diagnostic.dto'
import { StressDiagnosticResponseDto } from '../dtos/stress-diagnostic-response.dto'
import { StressDiagnosticService } from '../services/stress-diagnostic.service'

@Controller('stress-diagnostics')
@UseGuards(JwtAuthGuard)
export class StressDiagnosticController {
  constructor(private readonly stressDiagnosticService: StressDiagnosticService) {}

  @Post('questionnaires/:questionnaireId/submissions')
  async submitDiagnostic(
    @Param('questionnaireId', ParseIntPipe) questionnaireId: number,
    @Body() submitDto: SubmitStressDiagnosticDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<StressDiagnosticResponseDto> {
    return this.stressDiagnosticService.submitDiagnostic(questionnaireId, submitDto, currentUser)
  }

  @Get('history')
  async getHistory(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: StressDiagnosticHistoryQueryDto,
  ): Promise<StressDiagnosticResponseDto[]> {
    return this.stressDiagnosticService.getHistory(currentUser, query)
  }

  @Get('history/:diagnosticId')
  async getDiagnosticById(
    @Param('diagnosticId', ParseIntPipe) diagnosticId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<StressDiagnosticResponseDto> {
    return this.stressDiagnosticService.getDiagnosticById(diagnosticId, currentUser)
  }
}
