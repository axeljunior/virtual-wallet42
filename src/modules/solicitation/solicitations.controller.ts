import { CreateSolicitationDto } from './dto/create-solicitation.dto';
import { Body, ConflictException, Controller, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuth } from '../../commons/decorators/jwt-auth.decorator';
import { SolicitationsService } from './solicitations.service';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';

@ApiTags('Solicitations')
@Controller('solicitations')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService, private readonly solicitationService: SolicitationsService) {}

  @Post()
  @JwtAuth()
  async createTransactionTransfer(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser() currentUser: ICurrentUser) {

    const createTransactionResponse = await this.transactionsService.createTransaction(createTransactionDto, currentUser);

    if(!createTransactionResponse.success) return createTransactionResponse

    const newTransaction = createTransactionResponse.data;

    const createSolicitationResponse = await this.solicitationService.createSolicitation(newTransaction);

    if(!createSolicitationResponse.success) return createSolicitationResponse;

    return newTransaction;
  }

  @Patch(':solicitationId')
  @JwtAuth()
  async executeSolicitation(@Param('solicitationId') solicitationId: string) {
    const getSolicitationResponse = await this.solicitationService.getSolicitationById(solicitationId);

    if (!getSolicitationResponse.success) return getSolicitationResponse;

    const solicitation = getSolicitationResponse.data;

    if(solicitation.type === 'transferencia') {
      if (solicitation.status !== ESolicitationStatus.PENDING) {
        throw new ConflictException('Solicitação não está pendente');
      }

      const response = await this.transactionsService.excuteTransfer(solicitation.transaction.id);

      if(!response.success) return response

      await this.solicitationService.updateSolicitationStatus(solicitationId, ESolicitationStatus.COMPLETED);

      return response;
    }

    if(solicitation.type === 'CONTESTATION') {
      return await this.transactionsService.undoTransfer(solicitation.transaction.id);
    }
  }
}
