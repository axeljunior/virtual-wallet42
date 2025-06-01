import { Body, ConflictException, Controller, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuth } from '../../commons/decorators/jwt-auth.decorator';
import { SolicitationsService } from './solicitations.service';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';

@ApiTags('Solicitations')
@Controller('solicitations')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService, private readonly solicitationService: SolicitationsService) {}

  @Patch(':solicitationId')
  @JwtAuth()
  async executeSolicitation(@Param('solicitationId') solicitationId: string) {
    const solicitation:any = await this.solicitationService.getSolicitationById(solicitationId);

    if(solicitation.type === 'transferencia') {
      if (solicitation.status !== ESolicitationStatus.PENDING) {
        throw new ConflictException('Solicitação não está pendente');
      }
      try {
        await this.transactionsService.excuteTransfer(solicitation.transactionId);
        await this.solicitationService.updateSolicitationStatus(solicitationId, ESolicitationStatus.COMPLETED);

        return "Transferência executada com sucesso";
      } catch (error) {
        Logger.error(`Erro ao executar transferência: ${error.message}`, error.stack);
        throw new ConflictException('Erro ao executar a transferência');
      }
    }

    if(solicitation.type === 'CONTESTATION') {
      await this.transactionsService.validateContestation(solicitation.transactionId);
      return await this.transactionsService.undoTransfer(solicitation.transactionId);
    }
  }
}
