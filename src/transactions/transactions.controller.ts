import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { TransactionListResponse } from '@shared/interface/transaction.interface';
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
}
