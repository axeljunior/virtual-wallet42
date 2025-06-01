import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';

enum ETransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

@Injectable()
export class TransactionsService {

    constructor(@InjectRepository(TransactionEntity)
        private readonly transactionRepository: Repository<TransactionEntity>,
        private readonly userService: UsersService) { }
    async createTransaction(dto: CreateTransactionDto) {
        const sender = await this.userService.getUserByEmail(dto.sender.id);
        const receiver = await this.userService.getUserByEmail(dto.receiver.id);

        if (!sender || !receiver) {
            throw new NotFoundException('Sender or receiver not found');
        }

        const newTransaction = {
            sender: dto.sender,
            receiver: dto.receiver,
            value: dto.value,
        };

        await this.transactionRepository.save(newTransaction);

        Logger.log(`Transaction created: ${JSON.stringify(newTransaction)}`, 'TransactionsService');

        // delete newTransaction.password;
        return newTransaction;
    }

    async validateTransaction(transaction: TransactionEntity) {

        if (transaction.userSender.id === transaction.userReceiver.id) {
            throw new ConflictException('Sender and receiver cannot be the same user');
        }

        const sender = await this.userService.getUserByEmail(transaction?.userSender.email);
        const receiver = await this.userService.getUserByEmail(transaction?.userReceiver.email);

        if (!sender || !receiver) {
            throw new NotFoundException('Sender or receiver not found');
        }

        if (transaction.value <= 0) {
            return 'O valor de transferencia deve ser maior que 0'
        }

        if (sender.balance < transaction.value) {
            return 'Saldo insuficiente para executar a transferencia'
        }
    }

    async undoTransfer(transactionId) {}

    async validateContestation(transactionId: string) {
        const transaction = await this.transactionRepository.findOne({ where: { id: transactionId }, relations: ['userSender', 'userReceiver'] });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        await this.validateTransaction(transaction);
    }

    async excuteTransfer(transactionId: string) {
        const transaction = await this.transactionRepository.findOne({ where: { id: transactionId }, relations: ['userSender', 'userReceiver'] });

        if (!transaction) {
            throw new NotFoundException('Nenhuma transação encontrada');
        }

        if (!transaction.userSender || !transaction.userReceiver) {
            throw new NotFoundException('Os usuários envolvidos na transação não foram encontrados');
        }

        if (transaction.userSender.id === transaction.userReceiver.id) {
            throw new ConflictException('Os usuários remetente e destinatário não podem ser os mesmos');
        }

        if (transaction.value <= 0) {
            throw new BadRequestException('O valor de transferencia deve ser maior que 0')
        }

        if (transaction.userSender.balance < transaction.value) {
            throw new BadRequestException('Saldo insuficiente para executar a transferencia')
        }

        const newSendBalance = Number(transaction.userSender.balance) - Number(transaction.value);
        const newReceiverBalance = Number(transaction.userReceiver.balance) + Number(transaction.value);

        await this.userService.updateUserBalance(transaction.userSender.id, newSendBalance);
        await this.userService.updateUserBalance(transaction.userReceiver.id, newReceiverBalance);
    }
}
