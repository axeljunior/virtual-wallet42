import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('Transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

    @Patch(':transactionId')
    // @JwtAuth()
    // @Permissions({
    //   name: PermissionName.LIST,
    //   scope: PermissionScope.USER,
    // })
    transferBalance(@Param('transactionId') transactionId: string) {
      return this.transactionsService.excuteTransaction(transactionId);
    }

}
