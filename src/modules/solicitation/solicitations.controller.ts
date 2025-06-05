import { BadRequestException, Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuth } from '../../commons/decorators/jwt-auth.decorator';
import { SolicitationsService } from './solicitations.service';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { CreateTransactionTransferDto } from './dto/create-transaction-transfer.dto';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';
import { ETransactionType } from '../../commons/enums/transferencia-type.enum';
import { CreateTransactionContestationDto } from './dto/create-transaction-contestation.dto';

@ApiTags('Solicitations')
@Controller('solicitations')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService, private readonly solicitationService: SolicitationsService) {}

  @Patch(':solicitationId')
  @JwtAuth()
  async executeSolicitation(@Param('solicitationId') solicitationId: string) {
    const solicitation = await this.solicitationService.getSolicitationById(solicitationId);

    if (solicitation.status !== ESolicitationStatus.PENDING) throw new BadRequestException("A solicitação já foi processada")

    if(solicitation.type === ETransactionType.TRANSFER) {
      const executeTransferResponse = await this.transactionsService.excuteTransfer(solicitation.transaction.id);

      await this.solicitationService.updateSolicitationStatus(solicitationId, ESolicitationStatus.COMPLETED);

      return executeTransferResponse;
    }

    if(solicitation.type === ETransactionType.CONTESTATION) {
      const executeUndoTransferResponse = await this.transactionsService.undoTransfer(solicitation.transaction.id);

      await this.solicitationService.updateSolicitationStatus(solicitationId, ESolicitationStatus.COMPLETED);

      return executeUndoTransferResponse;
    }

    throw new BadRequestException('Solicitação invalida')
  }

  @Post()
  @JwtAuth()
  async createTransactionTransfer(@Body() createTransactionDto: CreateTransactionTransferDto, @CurrentUser() currentUser: ICurrentUser) {

    const newTransaction = await this.transactionsService.createTransaction(createTransactionDto, currentUser);

    await this.solicitationService.createSolicitation(newTransaction, ETransactionType.TRANSFER);

    return newTransaction;
  }

  @Post()
  @JwtAuth()
  async createTransactionContestation(@Body() createTransactionDto: CreateTransactionContestationDto, @CurrentUser() currentUser: ICurrentUser) {

    const findedTransaction = await this.transactionsService.getTransectionById(createTransactionDto.transferenceId)

    await this.solicitationService.createSolicitation(findedTransaction, ETransactionType.CONTESTATION);

    return findedTransaction;
  }
}