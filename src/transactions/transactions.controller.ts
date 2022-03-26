import { TransactionListResponse } from '@shared/interface/transaction.interface';
import { Transactions } from '@entity/transactions.entity';
import { Controller, Get, HttpCode, Param, Post, Body, Query } from '@nestjs/common';
import { newTransactionDTO } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller()
export class TransactionsController {
    constructor(
        private transactionsService: TransactionsService
    ) { }

    @Get('/transactions/:userId')
    @HttpCode(200)
    async getTransaction(
        @Param('userId') userId: string,
    ): Promise<TransactionListResponse> {
        return this.transactionsService.getTransactions(userId);
    }

    @Post('/transactions/create')
    @HttpCode(201)
    async createTransaction(
        @Body() newTransaction: newTransactionDTO
    ): Promise<Object> {
        return this.transactionsService.createTransaction(newTransaction);
    }

    @Get('/transactions/:userId/categories')
    @HttpCode(200)
    async getCategories(
        @Param('userId') userId: string,
        @Query('month') month: string,
    ): Promise<Object> {
        return this.transactionsService.getCategoriesForUserId(userId, month);
    }

    @Post('/user/:userId')
    @HttpCode(201)
    async createUser(
        @Param('userId') userId: string,
    ): Promise<Object> {
        return this.transactionsService.createUser(userId);
    }
}
