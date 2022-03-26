import { TransactionListResponse } from '@shared/interface/transaction.interface';
import { Transactions } from '@entity/transactions.entity';
import { Controller, Get, HttpCode, Param, Post, Body } from '@nestjs/common';
import { newTransactionDTO } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private transactionsService: TransactionsService
    ) { }

    @Get('/:userId')
    @HttpCode(200)
    async getTransaction(
        @Param('userId') userId: number,
    ): Promise<TransactionListResponse> {
        return this.transactionsService.getTransactions(userId);
    }

    @Post('/create')
    @HttpCode(201)
    async createTransaction(
        @Body() newTransaction: newTransactionDTO
    ): Promise<Object> {
        return this.transactionsService.createTransaction(newTransaction);
    }
}
