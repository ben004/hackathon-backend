import { Transactions } from '@entity/transactions.entity';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
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
    ): Promise<Transactions[]> {
        return this.transactionsService.getTransactions(userId);
    }
}
