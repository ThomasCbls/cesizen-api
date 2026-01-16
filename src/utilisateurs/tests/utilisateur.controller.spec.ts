import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateurController } from '../controllers/utilisateur.controller';
import { UtilisateurService } from '../services/utilisateur.service';
import { CreateUtilisateurDto } from '../dtos/create-utilisateur.dto';
import { UpdateUtilisateurDto } from '../dtos/update-utilisateur.dto';
import { UtilisateurResponseDto } from '../dtos/utilisateur-response.dto';

describe('UtilisateurController', () => {
  let controller: UtilisateurController;
  let service: UtilisateurService;

  const mockUtilisateurResponse: UtilisateurResponseDto = {
    id_utilisateur: '123e4567-e89b-12d3-a456-426614174000',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    role: 'user',
    date_inscription: new Date(),
    date_modification: new Date(),
    est_actif: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilisateurController],
      providers: [
        {
          provide: UtilisateurService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UtilisateurController>(UtilisateurController);
    service = module.get<UtilisateurService>(UtilisateurService);
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const createDto: CreateUtilisateurDto = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'password123456',
      };

      (service.create as jest.Mock).mockResolvedValue(mockUtilisateurResponse);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockUtilisateurResponse);
    });
  });

  describe('findAll', () => {
    it('devrait retourner une liste d\'utilisateurs', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([mockUtilisateurResponse]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUtilisateurResponse);
    });
  });

  describe('findById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      (service.findById as jest.Mock).mockResolvedValue(mockUtilisateurResponse);

      const result = await controller.findById(userId);

      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUtilisateurResponse);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateUtilisateurDto = {
        nom: 'Durand',
      };

      const updatedResponse = { ...mockUtilisateurResponse, ...updateDto };
      (service.update as jest.Mock).mockResolvedValue(updatedResponse);

      const result = await controller.update(userId, updateDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
      expect(result).toEqual(updatedResponse);
    });
  });

  describe('remove', () => {
    it('devrait supprimer un utilisateur', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      (service.remove as jest.Mock).mockResolvedValue(void 0);

      await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });
});
