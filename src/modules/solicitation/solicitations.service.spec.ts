import { Test, TestingModule } from '@nestjs/testing';
import { SolicitationsService } from './solicitations.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SolicitationEntity } from '../../providers/database/entities/solicitation.entity';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { Repository } from 'typeorm';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { ETransactionType } from '../../commons/enums/transferencia-type.enum';

describe('SolicitationsService', () => {
  let service: SolicitationsService;
  let solicitationRepository: jest.Mocked<Repository<SolicitationEntity>>;
  let usersService: jest.Mocked<UsersService>;

  const mockSolicitationRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  });

  const mockUsersService = () => ({
    getUserByEmail: jest.fn(),
    updateUserBalance: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitationsService,
        {
          provide: getRepositoryToken(SolicitationEntity),
          useFactory: mockSolicitationRepository,
        },
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SolicitationsService>(SolicitationsService);
    solicitationRepository = module.get(getRepositoryToken(SolicitationEntity));
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSolicitation', () => {
    it('should create a solicitation successfully', async () => {
      const mockTransaction = {
        id: '1',
        value: 100,
        userSender: { id: 'sender-id' },
        userReceiver: { id: 'receiver-id' },
        createdAt: new Date()
      } as unknown as TransactionEntity;

      const mockSolicitation = {
        id: 'solicitation-id',
        transaction: mockTransaction,
        status: ESolicitationStatus.PENDING,
        type: ETransactionType.TRANSFER,
      };

      solicitationRepository.create.mockReturnValue(mockSolicitation as any);
      solicitationRepository.save.mockResolvedValue(mockSolicitation as any);

      const result = await service.createSolicitation(mockTransaction);

      expect(result.success).toBe(true);
      expect(solicitationRepository.create).toHaveBeenCalledWith({
        transaction: mockTransaction,
        status: ESolicitationStatus.PENDING,
        type: ETransactionType.TRANSFER,
      });
      expect(solicitationRepository.save).toHaveBeenCalledWith(mockSolicitation);
    });

    it('should return error when database save fails', async () => {
      const mockTransaction = {
        id: '1',
        value: 100,
        createdAt: new Date()
      } as unknown as TransactionEntity;

      const mockSolicitation = {
        transaction: mockTransaction,
        status: ESolicitationStatus.PENDING,
        type: ETransactionType.TRANSFER,
      };

      solicitationRepository.create.mockReturnValue(mockSolicitation as any);
      solicitationRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.createSolicitation(mockTransaction);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(' Solicitation created: DatabaseError');
      }
    });
  });

  describe('getSolicitationById', () => {
    it('should return a solicitation when found', async () => {
      const mockSolicitation = {
        id: 'solicitation-id',
        status: ESolicitationStatus.PENDING,
      };

      solicitationRepository.findOne.mockResolvedValue(mockSolicitation as any);

      const result = await service.getSolicitationById('solicitation-id');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSolicitation);
      }
      expect(solicitationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'solicitation-id' }, relations: ['transaction']
      });
    });

    it('should return error when solicitation not found', async () => {
      solicitationRepository.findOne.mockResolvedValue(null);

      const result = await service.getSolicitationById('nonexistent-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SolicitationNotFound');
      }
    });
  });

  describe('updateSolicitationStatus', () => {
    it('should update solicitation status', async () => {
      const solicitationId = 'solicitation-id';
      const newStatus = ESolicitationStatus.COMPLETED;

      solicitationRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateSolicitationStatus(solicitationId, newStatus);

      expect(solicitationRepository.update).toHaveBeenCalledWith(solicitationId, {
        status: newStatus,
      });
    });
  });
}); 