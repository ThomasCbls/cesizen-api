import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common'
import { UtilisateurService } from 'src/utilisateurs/services/utilisateur.service'

@Controller('auth')
export class AuthController {
  constructor(private utilisateurService: UtilisateurService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    // Trouver l'utilisateur avec le mot de passe (pour validation)
    const utilisateur = await this.utilisateurService.findByEmailWithPassword(loginDto.email)

    if (!utilisateur) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    // Valider le mot de passe
    const isPasswordValid = await this.utilisateurService.validatePassword(
      loginDto.password,
      utilisateur.mot_de_passe,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    // Retourner l'utilisateur (sans le mot de passe)
    return {
      success: true,
      user: {
        id: utilisateur.id_utilisateur,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
    }
  }
}
