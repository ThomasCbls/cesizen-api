import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import { ChangePasswordDto } from '../utilisateurs/dtos/change-password.dto'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { LoginDto } from './dtos/login.dto'
import { PasswordActionDto, PasswordValidationPromptDto } from './dtos/password-validation.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user)
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.refresh(user)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout() {
    return { success: true }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, changePasswordDto)
  }

  /**
   * Obtenir le prompt et les instructions pour la création/modification de mot de passe
   * @param action 'create' ou 'change'
   * @returns Prompt avec les instructions et recommandations
   */
  @Get('password-prompt')
  @HttpCode(HttpStatus.OK)
  getPasswordPrompt(@Query('action') action: 'create' | 'change' = 'change') {
    return {
      validationRules: new PasswordValidationPromptDto(),
      passwordAction: new PasswordActionDto(action),
    }
  }
}
