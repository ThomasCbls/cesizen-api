import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'
import { StressDiagnosticHistoryQueryDto } from '../dtos/stress-diagnostic-history-query.dto'
import { SubmitStressDiagnosticDto } from '../dtos/submit-stress-diagnostic.dto'
import { StressDiagnosticService } from '../services/stress-diagnostic.service'

@Controller('stress-diagnostics')
@UseGuards(JwtAuthGuard)
export class StressDiagnosticController {
  constructor(private readonly stressDiagnosticService: StressDiagnosticService) {}

  @Post('questionnaires/:questionnaireId/submissions')
  async submitDiagnostic(
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
    @Body() submitDto: SubmitStressDiagnosticDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.stressDiagnosticService.submitDiagnostic(questionnaireId, submitDto, currentUser)
  }

  @Get('history')
  async getHistory(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: StressDiagnosticHistoryQueryDto,
  ) {
    return this.stressDiagnosticService.getHistory(currentUser, query)
  }

  @Get('history/:diagnosticId')
  async getDiagnosticById(
    @Param('diagnosticId', ParseUUIDPipe) diagnosticId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.stressDiagnosticService.getDiagnosticById(diagnosticId, currentUser)
  }
}
