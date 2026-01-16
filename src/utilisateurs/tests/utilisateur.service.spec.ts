import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UtilisateurService } from '../services/utilisateur.service';
import { UtilisateurRepository } from '../repositories/utilisateur.repository';
import { CreateUtilisateurDto } from '../dtos/create-utilisateur.dto';
import { UpdateUtilisateurDto } from '../dtos/update-utilisateur.dto';
import { Utilisateur } from '../entities/utilisateur.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UtilisateurService', () => {
  let service: UtilisateurService;
  let repository: UtilisateurRepository;

  const mockUtilisateur: Utilisateur = {
    id_utilisateur: '123e4567-e89b-12d3-a456-426614174000',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    mot_de_passe: 'hashedPassword123',
    role: 'user',
    date_inscription: new Date(),
    date_modification: new Date(),
    est_actif: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilisateurService,
        {
          provide: UtilisateurRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findByEmail: jest.fn(),
            findAllActifs: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UtilisateurService>(UtilisateurService);
    repository = module.get<UtilisateurRepository>(UtilisateurRepository);
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const createDto: CreateUtilisateurDto = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'password123456',
        role: 'user',
      };

      (repository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (repository.create as jest.Mock).mockReturnValue(mockUtilisateur);
      (repository.save as jest.Mock).mockResolvedValue(mockUtilisateur);

      const result = await service.create(createDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(createDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.mot_de_passe, 10);
      expect(result).toBeDefined();
      expect(result.email).toBe(createDto.email);
    });

    it('devrait lever une exception si l\'email existe déjà', async () => {
      const createDto: CreateUtilisateurDto = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'password123456',
      };

      (repository.findByEmail as jest.Mock).mockResolvedValue(mockUtilisateur);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les utilisateurs actifs', async () => {
      (repository.findAllActifs as jest.Mock).mockResolvedValue([mockUtilisateur]);

      const result = await service.findAll();

      expect(repository.findAllActifs).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe(mockUtilisateur.email);
    });
  });

  describe('findById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(mockUtilisateur);

      const result = await service.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(repository.findById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result.email).toBe(mockUtilisateur.email);
    });

    it('devrait lever une exception si l\'utilisateur n\'existe pas', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const updateDto: UpdateUtilisateurDto = {
        nom: 'Durand',
        prenom: 'Pierre',
      };

      (repository.findById as jest.Mock).mockResolvedValue(mockUtilisateur);
      (repository.save as jest.Mock).mockResolvedValue({ ...mockUtilisateur, ...updateDto });

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(result.nom).toBe(updateDto.nom);
    });

    it('devrait lever une exception si l\'utilisateur n\'existe pas', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { nom: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('devrait désactiver un utilisateur (soft delete)', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(mockUtilisateur);
      (repository.save as jest.Mock).mockResolvedValue({
        ...mockUtilisateur,
        est_actif: false,
      });

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(repository.findById).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe correct', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('password123456', 'hashedPassword123');

      expect(result).toBe(true);
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrongPassword', 'hashedPassword123');

      expect(result).toBe(false);
    });
  });
});
