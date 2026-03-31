import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { UtilisateurService } from '../utilisateurs/services/utilisateur.service'

describe('AuthService', () => {
  let service: AuthService

  const mockUtilisateur = {
    id_utilisateur: '08f6f8c2-2f35-43a9-96df-9cc6e7d38101',
    email: 'stress@test.dev',
    nom: 'Stress',
    prenom: 'Tester',
    role: 'user',
    mot_de_passe: 'hashed-password',
  }

  const mockUtilisateurService = {
    findByEmailWithPassword: jest.fn(),
    validatePassword: jest.fn(),
  }

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('jwt-token'),
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue('1h'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UtilisateurService,
          useValue: mockUtilisateurService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
    mockConfigService.get.mockReturnValue('1h')
    mockJwtService.signAsync.mockResolvedValue('jwt-token')
  })

  it('returns a bearer token when credentials are valid', async () => {
    mockUtilisateurService.findByEmailWithPassword.mockResolvedValue(mockUtilisateur)
    mockUtilisateurService.validatePassword.mockResolvedValue(true)

    const result = await service.login({
      email: mockUtilisateur.email,
      password: 'Password123!',
    })

    expect(result).toEqual({
      success: true,
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: '1h',
      user: {
        id: mockUtilisateur.id_utilisateur,
        email: mockUtilisateur.email,
        nom: mockUtilisateur.nom,
        prenom: mockUtilisateur.prenom,
        role: mockUtilisateur.role,
      },
    })
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUtilisateur.id_utilisateur,
      email: mockUtilisateur.email,
      role: mockUtilisateur.role,
      nom: mockUtilisateur.nom,
      prenom: mockUtilisateur.prenom,
    })
  })

  it('throws UnauthorizedException when the email is unknown', async () => {
    mockUtilisateurService.findByEmailWithPassword.mockResolvedValue(null)

    await expect(
      service.login({
        email: 'unknown@test.dev',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('throws UnauthorizedException when the password is invalid', async () => {
    mockUtilisateurService.findByEmailWithPassword.mockResolvedValue(mockUtilisateur)
    mockUtilisateurService.validatePassword.mockResolvedValue(false)

    await expect(
      service.login({
        email: mockUtilisateur.email,
        password: 'WrongPassword123!',
      }),
    ).rejects.toThrow(UnauthorizedException)
  })
})
