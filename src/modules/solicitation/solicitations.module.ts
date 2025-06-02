import { Module } from '@nestjs/common';
import { TransactionsController } from './solicitations.controller';
import { TransactionsService } from './transactions.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../../providers/database/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { SolicitationsService } from './solicitations.service';
import { SolicitationEntity } from '../../providers/database/entities/solicitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TransactionEntity, SolicitationEntity])],
  controllers: [TransactionsController],
  providers: [TransactionsService, SolicitationsService, UsersService],
})
export class TransactionsModule {}
