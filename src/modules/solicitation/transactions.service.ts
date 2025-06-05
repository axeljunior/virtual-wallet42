import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateTransactionTransferDto } from './dto/create-transaction-transfer.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';

@Injectable()
export class TransactionsService {

    constructor(@InjectRepository(TransactionEntity)
        private readonly transactionRepository: Repository<TransactionEntity>,
        private readonly userService: UsersService) { }
    async createTransaction(dto: CreateTransactionTransferDto, user: ICurrentUser) {
        const sender = await this.userService.getUserByEmail(user.email);
        const receiver = await this.userService.getUserByEmail(dto.receiverEmail);

        if (!sender || !receiver) {
            throw new NotFoundException('Usuário remetente ou destinatário não encontrado')
        }

        if (!sender.id === !receiver.id) {
            throw new ConflictException('Usuário remetente e destinatário não podem ser iguais')
        }

        try {
            const newTransaction = this.transactionRepository.create({
                userSender: sender,
                userReceiver: receiver,
                value: dto.value,
            });

            await this.transactionRepository.save(newTransaction);

            return newTransaction;

        } catch (e) {
            Logger.error(`Erro ao criar transação: ${e.message}`, 'TransactionsService');
            throw new InternalServerErrorException('DatabaseError: Erro ao criar transação');
        }
    }

    async validateTransaction(transaction: TransactionEntity | null) {

        if (!transaction) {
            throw new NotFoundException('Transação não encontrada');
        }

        if (!transaction.userSender || !transaction.userReceiver) {
            throw new NotFoundException('Usuários envolvidos na transação não encontrados');
        }

        if (transaction.userSender.id === transaction.userReceiver.id) {
            throw new ConflictException('Os usuários remetente e destinatário não podem ser os mesmos');
        }

        if (transaction.value <= 0) {
            throw new BadRequestException('O valor da transferência deve ser maior que 0');
        }

        if (transaction.userSender.balance < transaction.value) {
            throw new BadRequestException('Saldo insuficiente para realizar a transferência');
        }
        return transaction;
    }

    async undoTransfer(transactionId: string) {
        const transaction = await this.getTransectionById(transactionId)

        const validatedTransaction = await this.validateTransaction(transaction);

        const newSendBalance = Number(validatedTransaction.userSender.balance) + Number(validatedTransaction.value);
        const newReceiverBalance = Number(validatedTransaction.userReceiver.balance) - Number(validatedTransaction.value);

        await this.userService.updateUserBalance(validatedTransaction.userSender.id, newSendBalance);
        await this.userService.updateUserBalance(validatedTransaction.userReceiver.id, newReceiverBalance);

        return validatedTransaction;
    }

    async getTransectionById(transactionId: string) {
        const findedTransaction = await this.transactionRepository.findOne({ where: { id: transactionId }, relations: ['userSender', 'userReceiver'] });

        if(!findedTransaction) {
            throw new NotFoundException(`Transação '${transactionId}' não encontrada`)
        }

        return findedTransaction
    }

    async excuteTransfer(transactionId: string) {
        const transaction = await this.getTransectionById(transactionId)

        const validatedTransaction = await this.validateTransaction(transaction);

        const newSendBalance = Number(validatedTransaction.userSender.balance) - Number(validatedTransaction.value);
        const newReceiverBalance = Number(validatedTransaction.userReceiver.balance) + Number(validatedTransaction.value);

        await this.userService.updateUserBalance(validatedTransaction.userSender.id, newSendBalance);
        await this.userService.updateUserBalance(validatedTransaction.userReceiver.id, newReceiverBalance);

        return validatedTransaction;
    }
}
