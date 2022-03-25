import { Transactions } from '@entity/transactions.entity';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private transactionsService: TransactionsService
    ) { }

    @Get()
    @HttpCode(200)
    async getTransaction(): Promise<Transactions[]> {
        return this.transactionsService.getTransactions();
    }
}
