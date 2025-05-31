import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuth } from 'src/commons/decorators/jwt-auth.decorator';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

    @Patch(':transactionId')
    @JwtAuth()
    transferBalance(@Param('transactionId') transactionId: string) {
      return this.transactionsService.excuteTransaction(transactionId);
    }

}
