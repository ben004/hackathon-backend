import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from '@entity/transactions.entity';
import { Users } from '@entity/user.entity';
import { Categories } from '@entity/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions, Users, Categories])],
  providers: [TransactionsService],
  controllers: [TransactionsController]
})
export class TransactionsModule {}
