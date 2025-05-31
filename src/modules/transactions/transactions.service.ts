import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { IUser } from '../users/dto/user.dto';

enum ETransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

const TRANSACTIONS_TESTE: ITransaction[] = [
    {
        id: '1',
        status: ETransactionStatus.PENDING,
        sender: { id: '1', username: 'Fernanda bo re mi pasode', balance: 5 },
        receiver: { id: '3', username: 'User Teste', balance: 50000 },
        value: 50
    }
];

interface ITransaction {
  id: string; // Unique transaction identifier
  status: ETransactionStatus; // Current status of the transaction
  sender: IUser;
  receiver: IUser;
  value: number; // Transferred amount
//   timestamp: string; // ISO date string for when the transaction occurred
}

@Injectable()
export class TransactionsService {

    constructor(private readonly userService: UsersService) { }
    async createTransaction(dto: CreateTransactionDto) {
        const sender = await this.userService.getUserByEmail(dto.sender.id);
        const receiver = await this.userService.getUserByEmail(dto.receiver.id);

        if (!sender || !receiver) {
            throw new NotFoundException('Sender or receiver not found');
        }

        const newTransaction = {
            id: (TRANSACTIONS_TESTE.length + 1).toString(),
            sender: dto.sender,
            status: ETransactionStatus.PENDING, // Default status
            receiver: dto.receiver,
            value: dto.value,
        };

        TRANSACTIONS_TESTE.push(newTransaction);

        Logger.log(`Transaction created: ${JSON.stringify(newTransaction)}`, 'TransactionsService');

        // delete newTransaction.password;
        return newTransaction;

    }

    async validateTransaction(transaction: ITransaction) {

        if (transaction.sender.id === transaction.receiver.id) {
            throw new ConflictException('Sender and receiver cannot be the same user');
        }

        const sender = await this.userService.getUserByEmail(transaction?.sender.id);
        const receiver = await this.userService.getUserByEmail(transaction?.receiver.id);

        if (!sender || !receiver) {
            throw new NotFoundException('Sender or receiver not found');
        }

        return {
            isValid: true,
            statusCode: 200
        }
    }

    async excuteTransaction(transactionId: string) {
        const transaction = TRANSACTIONS_TESTE.find(t => t.id === transactionId);

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        await this.validateTransaction(transaction);

        const newSendBalance = transaction.sender.balance -= transaction.value;
        const newReceiverBalance = transaction.receiver.balance += transaction.value;

        await this.userService.updateUserBalance(transaction.sender.id, newSendBalance);
        await this.userService.updateUserBalance(transaction.receiver.id, newReceiverBalance);

        // Simulate a transaction lookup

        return `Transaction ${transactionId} executed successfully`;
    }
}
