import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginDto } from './dtos/login.dto'
import { AuthenticatedUser } from './interfaces/authenticated-user.interface'
import { UtilisateurService } from '../utilisateurs/services/utilisateur.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly utilisateurService: UtilisateurService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const utilisateur = await this.utilisateurService.findByEmailWithPassword(loginDto.email)

    if (!utilisateur) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const isPasswordValid = await this.utilisateurService.validatePassword(
      loginDto.password,
      utilisateur.mot_de_passe,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const payload: AuthenticatedUser = {
      sub: utilisateur.id_utilisateur,
      email: utilisateur.email,
      role: utilisateur.role,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
    }

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h')

    return {
      success: true,
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn,
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
