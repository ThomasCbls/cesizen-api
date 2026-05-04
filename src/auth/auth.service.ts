import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UtilisateurService } from '../utilisateurs/services/utilisateur.service'
import { LoginDto } from './dtos/login.dto'
import { AuthenticatedUser } from './interfaces/authenticated-user.interface'

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

    const accessToken = await this.jwtService.signAsync(payload)

    return {
      access_token: accessToken,
      user: {
        id: utilisateur.id_utilisateur,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
    }
  }

  async getProfile(user: AuthenticatedUser) {
    return {
      id: user.sub,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    }
  }

  async refresh(user: AuthenticatedUser) {
    const payload: AuthenticatedUser = {
      sub: user.sub,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    }

    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}
