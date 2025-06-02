import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './solicitations.controller';
import { TransactionsService } from './transactions.service';
import { SolicitationsService } from './solicitations.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';
import { ConflictException, HttpException } from '@nestjs/common';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { ok, err } from 'tryless';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { SolicitationEntity } from '../../providers/database/entities/solicitation.entity';
import { ETransactionType } from '../../commons/enums/transferencia-type.enum';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: jest.Mocked<TransactionsService>;
  let solicitationsService: jest.Mocked<SolicitationsService>;

  const mockTransactionsService = () => ({
    createTransaction: jest.fn(),
    excuteTransfer: jest.fn(),
    undoTransfer: jest.fn(),
  });

  const mockSolicitationsService = () => ({
    createSolicitation: jest.fn(),
    getSolicitationById: jest.fn(),
    updateSolicitationStatus: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useFactory: mockTransactionsService,
        },
        {
          provide: SolicitationsService,
          useFactory: mockSolicitationsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get(TransactionsService);
    solicitationsService = module.get(SolicitationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransactionTransfer', () => {
    it('should create transaction and solicitation successfully', async () => {
      const dto: CreateTransactionDto = {
        receiverEmail: 'receiver@example.com',
        value: 100,
      };

      const currentUser: ICurrentUser = {
        id: 'user-id',
        email: 'sender@example.com',
      };

      const mockTransaction = {
        id: 'transaction-id',
        value: 100,
        userSender: { id: 'user-id', email: 'sender@example.com' },
        userReceiver: { id: 'receiver-id', email: 'receiver@example.com' },
        createdAt: new Date()
      } as unknown as TransactionEntity;

      transactionsService.createTransaction.mockResolvedValue({
        success: true,
        data: mockTransaction
      } as any);
      solicitationsService.createSolicitation.mockResolvedValue({
        success: true
      } as any);

      const result = await controller.createTransactionTransfer(dto, currentUser);

      expect(result).toEqual(ok(mockTransaction));
      expect(transactionsService.createTransaction).toHaveBeenCalledWith(dto, currentUser);
      expect(solicitationsService.createSolicitation).toHaveBeenCalledWith(mockTransaction);
    });

    it('should return error when transaction creation fails', async () => {
      const dto: CreateTransactionDto = {
        receiverEmail: 'receiver@example.com',
        value: 100,
      };

      const currentUser: ICurrentUser = {
        id: 'user-id',
        email: 'sender@example.com',
      };

      const errorResponse = {
        success: false,
        error: 'Transaction created: UserNotFound',
        reason: 'Erro ao criar transação'
      };

      transactionsService.createTransaction.mockResolvedValue(errorResponse as any);

      expect(controller.createTransactionTransfer(dto, currentUser)).rejects.toBeTruthy();
      expect(solicitationsService.createSolicitation).not.toHaveBeenCalled();
    });

    it('should return error when solicitation creation fails', async () => {
      const dto: CreateTransactionDto = {
        receiverEmail: 'receiver@example.com',
        value: 100,
      };

      const currentUser: ICurrentUser = {
        id: 'user-id',
        email: 'sender@example.com',
      };

      const mockTransaction = {
        id: 'transaction-id',
        value: 100,
        createdAt: new Date()
      } as unknown as TransactionEntity;

      const errorResponse = {
        success: false,
        error: ' Solicitation created: DatabaseError',
        reason: 'Erro ao criar solicitação'
      };

      transactionsService.createTransaction.mockResolvedValue({
        success: true,
        data: mockTransaction
      } as any);
      solicitationsService.createSolicitation.mockResolvedValue(errorResponse as any);


      expect(controller.createTransactionTransfer(dto, currentUser)).rejects.toThrow();
    });
  });

  describe('executeSolicitation', () => {
    it('should execute transfer solicitation successfully', async () => {
      const solicitationId = 'solicitation-id';
      const mockSolicitation = {
        id: solicitationId,
        status: ESolicitationStatus.PENDING,
        type: ETransactionType.TRANSFER,
        transaction: { id: 'transaction-id' },
        createdAt: new Date(),
        updatedAt: new Date()
      } as SolicitationEntity;

      solicitationsService.getSolicitationById.mockResolvedValue({
        success: true,
        data: mockSolicitation
      } as any);
      transactionsService.excuteTransfer.mockResolvedValue({
        success: true
      } as any);
      solicitationsService.updateSolicitationStatus.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: []
      } as any);

      const result = await controller.executeSolicitation(solicitationId);

      expect(result).toEqual({ success: true });
      expect(solicitationsService.getSolicitationById).toHaveBeenCalledWith(solicitationId);
      expect(transactionsService.excuteTransfer).toHaveBeenCalledWith('transaction-id');
      expect(solicitationsService.updateSolicitationStatus).toHaveBeenCalledWith(
        solicitationId,
        ESolicitationStatus.COMPLETED,
      );
    });

    it('should return error when solicitation not found', async () => {
      const solicitationId = 'nonexistent-id';
      const errorResponse = {
        success: false,
        error: 'SolicitationNotFound',
        reason: 'Solicitação não encontrada'
      };

      solicitationsService.getSolicitationById.mockResolvedValue(errorResponse as any);

      const result = await controller.executeSolicitation(solicitationId);

      expect(result).toEqual(errorResponse);
      expect(transactionsService.excuteTransfer).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when solicitation is not pending', async () => {
      const solicitationId = 'solicitation-id';
      const mockSolicitation = {
        id: solicitationId,
        status: ESolicitationStatus.COMPLETED,
        type: ETransactionType.TRANSFER,
        transaction: { id: 'transaction-id' },
        createdAt: new Date(),
        updatedAt: new Date()
      } as SolicitationEntity;

      solicitationsService.getSolicitationById.mockResolvedValue({
        success: true,
        data: mockSolicitation
      } as any);

      await expect(controller.executeSolicitation(solicitationId)).rejects.toThrow(
        HttpException,
      );
      expect(transactionsService.excuteTransfer).not.toHaveBeenCalled();
    });

    it('should return error when execute transfer fails', async () => {
      const solicitationId = 'solicitation-id';
      const mockSolicitation = {
        id: solicitationId,
        status: ESolicitationStatus.PENDING,
        type: ETransactionType.TRANSFER,
        transaction: { id: 'transaction-id' },
        createdAt: new Date(),
        updatedAt: new Date()
      } as SolicitationEntity;

      const errorResponse = {
        success: false,
        error: 'TransferValueNotEnough',
        reason: 'Erro ao executar transferência'
      };

      solicitationsService.getSolicitationById.mockResolvedValue({
        success: true,
        data: mockSolicitation
      } as any);
      transactionsService.excuteTransfer.mockResolvedValue(errorResponse as any);

      const result = await controller.executeSolicitation(solicitationId);

      expect(result).toEqual(errorResponse);
      expect(solicitationsService.updateSolicitationStatus).not.toHaveBeenCalled();
    });

    it('should handle contestation type solicitation', async () => {
      const solicitationId = 'solicitation-id';
      const mockSolicitation = {
        id: solicitationId,
        status: ESolicitationStatus.PENDING,
        type: 'CONTESTATION',
        transaction: { id: 'transaction-id' },
        createdAt: new Date(),
        updatedAt: new Date()
      } as SolicitationEntity;

      solicitationsService.getSolicitationById.mockResolvedValue({
        success: true,
        data: mockSolicitation
      } as any);
      transactionsService.undoTransfer.mockResolvedValue({
        success: true
      } as any);

      const result = await controller.executeSolicitation(solicitationId);

      expect(result).toEqual({ success: true });
      expect(transactionsService.undoTransfer).toHaveBeenCalledWith('transaction-id');
    });
  });
});