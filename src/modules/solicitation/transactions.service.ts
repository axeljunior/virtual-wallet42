import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';
import { err, ok } from 'tryless';

@Injectable()
export class TransactionsService {

    constructor(@InjectRepository(TransactionEntity)
        private readonly transactionRepository: Repository<TransactionEntity>,
        private readonly userService: UsersService) { }
    async createTransaction(dto: CreateTransactionDto, user: ICurrentUser) {
        const sender = await this.userService.getUserByEmail(user.email);
        const receiver = await this.userService.getUserByEmail(dto.receiverEmail);

        if (!sender || !receiver) {
            return err("Transaction created: UserNotFound", 'Usuário remetente ou destinatário não encontrado');
        }

        try {
            const newTransaction = this.transactionRepository.create({
                userSender: sender,
                userReceiver: receiver,
                value: dto.value,
            });

            await this.transactionRepository.save(newTransaction);

            return ok(newTransaction);

        } catch (e) {
            Logger.error(`Error creating transaction: ${e.message}`, 'TransactionsService');
            return err("Transaction created: DatabaseError", 'Erro ao criar transação');
        }

    }

    async validateTransaction(transaction: TransactionEntity | null) {

        if (!transaction) {
            return err("NotFound", 'Nenhuma transação encontrada')
        }

        if (!transaction.userSender || !transaction.userReceiver) {
            return err("UserNotFound", 'Os usuários envolvidos na transação não foram encontrados')
        }

        if (transaction.userSender.id === transaction.userReceiver.id) {
            return err("UserMustBeDifferent", 'Os usuários remetente e destinatário não podem ser os mesmos')
        }

        if (transaction.value <= 0) {
            return err("TransferValueGreaterThanZero", 'O valor de transferencia deve ser maior que 0')
        }

        if (transaction.userSender.balance < transaction.value) {
            return err("TransferValueNotEnough", 'Saldo insuficiente para executar a transferencia')
        }

        return ok();
    }

    async undoTransfer(transactionId: string) {
        const transaction = await this.transactionRepository.findOne({ where: { id: transactionId }, relations: ['userSender', 'userReceiver'] });

        const isValidTransaction = await this.validateTransaction(transaction);

        if (!isValidTransaction.success) {
            return isValidTransaction;
        }

    }

    async excuteTransfer(transactionId: string) {
        const transaction = await this.transactionRepository.findOne({ where: { id: transactionId }, relations: ['userSender', 'userReceiver'] });

        const isValidTransaction = await this.validateTransaction(transaction);

        if (!isValidTransaction.success) {
            return isValidTransaction;
        }

        const validatedTransaction = transaction!;

        const newSendBalance = Number(validatedTransaction.userSender.balance) - Number(validatedTransaction.value);
        const newReceiverBalance = Number(validatedTransaction.userReceiver.balance) + Number(validatedTransaction.value);

        let updateUserBalanseResult = await this.userService.updateUserBalance(validatedTransaction.userSender.id, newSendBalance);

        if(!updateUserBalanseResult.success) return updateUserBalanseResult

        await this.userService.updateUserBalance(validatedTransaction.userReceiver.id, newReceiverBalance);

        if(!updateUserBalanseResult.success) return updateUserBalanseResult

        return ok()
    }
}
