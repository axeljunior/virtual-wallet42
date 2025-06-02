import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { Repository } from 'typeorm';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: jest.Mocked<Repository<TransactionEntity>>;
  let usersService: jest.Mocked<UsersService>;

  const mockTransactionRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  });

  const mockUsersService = () => ({
    getUserByEmail: jest.fn(),
    updateUserBalance: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useFactory: mockTransactionRepository,
        },
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get(getRepositoryToken(TransactionEntity));
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransaction', () => {

    it('should return error when user not found', async () => {
      const dto: CreateTransactionDto = {
        receiverEmail: 'nonexistent@example.com',
        value: 100,
      };

      const currentUser: ICurrentUser = {
        id: 'sender-id',
        email: 'sender@example.com',
      };

      const mockSender = {
        id: 'sender-id',
        email: 'sender@example.com',
        balance: 200,
      };

      usersService.getUserByEmail.mockImplementation((email) => {
        if (email === currentUser.email) return Promise.resolve(mockSender as any);
        return Promise.resolve(null);
      });

      const result = await service.createTransaction(dto, currentUser);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Transaction created: UserNotFound');
      }
    });

  describe('validateTransaction', () => {
    it('should validate a valid transaction', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        userSender: {
          id: 'sender-id',
          balance: 200,
        },
        userReceiver: {
          id: 'receiver-id',
          balance: 50,
        },
        value: 100,
      };

      const result = await service.validateTransaction(mockTransaction as any);

      expect(result.success).toBe(true);
    });

    it('should return error when transaction is null', async () => {
      const result = await service.validateTransaction(null);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NotFound');
      }
    });

    it('should return error when users are missing', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        value: 100,
      };

      const result = await service.validateTransaction(mockTransaction as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('UserNotFound');
      }
    });

    it('should return error when sender and receiver are the same', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        userSender: {
          id: 'same-id',
          balance: 200,
        },
        userReceiver: {
          id: 'same-id',
          balance: 200,
        },
        value: 100,
      };

      const result = await service.validateTransaction(mockTransaction as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('UserMustBeDifferent');
      }
    });

    it('should return error when value is not positive', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        userSender: {
          id: 'sender-id',
          balance: 200,
        },
        userReceiver: {
          id: 'receiver-id',
          balance: 50,
        },
        value: 0,
      };

      const result = await service.validateTransaction(mockTransaction as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('TransferValueGreaterThanZero');
      }
    });

    it('should return error when sender has insufficient balance', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        userSender: {
          id: 'sender-id',
          balance: 50,
        },
        userReceiver: {
          id: 'receiver-id',
          balance: 50,
        },
        value: 100,
      };

      const result = await service.validateTransaction(mockTransaction as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('TransferValueNotEnough');
      }
    });
  });

  describe('excuteTransfer', () => {
    it('should execute transfer successfully', async () => {
      const transactionId = 'transaction-id';
      const mockTransaction = {
        id: transactionId,
        userSender: {
          id: 'sender-id',
          balance: 200,
        },
        userReceiver: {
          id: 'receiver-id',
          balance: 50,
        },
        value: 100,
      };

      transactionRepository.findOne.mockResolvedValue(mockTransaction as any);
      usersService.updateUserBalance.mockResolvedValue({ success: true } as any);

      const result = await service.excuteTransfer(transactionId);

      expect(result.success).toBe(true);
      expect(usersService.updateUserBalance).toHaveBeenCalledWith('sender-id', 100);
      expect(usersService.updateUserBalance).toHaveBeenCalledWith('receiver-id', 150);
    });

    it('should return error when transaction validation fails', async () => {
      const transactionId = 'transaction-id';
      const mockTransaction = {
        id: transactionId,
        userSender: {
          id: 'sender-id',
          balance: 50,
        },
        userReceiver: {
          id: 'receiver-id',
          balance: 50,
        },
        value: 100,
      };

      transactionRepository.findOne.mockResolvedValue(mockTransaction as any);

      const result = await service.excuteTransfer(transactionId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('TransferValueNotEnough');
      }
    });

    it('should return error when updating sender balance fails', async () => {
      const transactionId = 'transaction-id';
      const mockTransaction = {
        id: transactionId,
        userSender: {
          id: 'sender-id',
          balance: 200,
        },
        userReceiver: {
          id: 'receiver-id',
          balance: 50,
        },
        value: 100,
      };

      transactionRepository.findOne.mockResolvedValue(mockTransaction as any);
      usersService.updateUserBalance.mockResolvedValueOnce({
        success: false,
        error: 'User update balance: DatabaseError',
        reason: { userId: 'sender-id', message: 'Erro ao atualizar saldo', e: new Error() }
      } as any);

      const result = await service.excuteTransfer(transactionId);

      expect(result.success).toBe(false);
    });
  });
});
})