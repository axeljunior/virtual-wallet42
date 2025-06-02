import { CreateSolicitationDto } from './dto/create-solicitation.dto';
import { BadRequestException, Body, ConflictException, Controller, Get, HttpException, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuth } from '../../commons/decorators/jwt-auth.decorator';
import { SolicitationsService } from './solicitations.service';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';
import { ok } from 'tryless';
import { ETransactionType } from '../../commons/enums/transferencia-type.enum';

@ApiTags('Solicitations')
@Controller('solicitations')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService, private readonly solicitationService: SolicitationsService) {}

  @Post()
  @JwtAuth()
  async createTransactionTransfer(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser() currentUser: ICurrentUser) {

    const createTransactionResponse = await this.transactionsService.createTransaction(createTransactionDto, currentUser);

    if(!createTransactionResponse.success) throw new HttpException(createTransactionResponse, HttpStatus.BAD_REQUEST);

    const newTransaction = createTransactionResponse.data;

    const createSolicitationResponse = await this.solicitationService.createSolicitation(newTransaction);

    if(!createSolicitationResponse.success) throw new HttpException(createSolicitationResponse, HttpStatus.BAD_REQUEST);

    return createTransactionResponse;
  }

  @Patch(':solicitationId')
  @JwtAuth()
  async executeSolicitation(@Param('solicitationId') solicitationId: string) {
    const getSolicitationResponse = await this.solicitationService.getSolicitationById(solicitationId);

    if (!getSolicitationResponse.success) return getSolicitationResponse;

    const solicitation = getSolicitationResponse.data;

    if(solicitation.type === ETransactionType.TRANSFER) {
      if (solicitation.status !== ESolicitationStatus.PENDING) throw new HttpException("A solicitação já foi processada", HttpStatus.BAD_REQUEST)

      const executeTransferResponse = await this.transactionsService.excuteTransfer(solicitation.transaction.id);

      if(!executeTransferResponse.success) return executeTransferResponse

      await this.solicitationService.updateSolicitationStatus(solicitationId, ESolicitationStatus.COMPLETED);

      return executeTransferResponse;
    }

    if(solicitation.type === 'CONTESTATION') {
      if (solicitation.status !== ESolicitationStatus.PENDING) throw new HttpException("A solicitação já foi processada", HttpStatus.BAD_REQUEST)

      const executeUndoTransferResponse = await this.transactionsService.undoTransfer(solicitation.transaction.id);

      if(!executeUndoTransferResponse.success) return executeUndoTransferResponse

      await this.solicitationService.updateSolicitationStatus(solicitationId, ESolicitationStatus.COMPLETED);

      return executeUndoTransferResponse;
    }

    throw new BadRequestException('Invalid solicitation type')
  }
}