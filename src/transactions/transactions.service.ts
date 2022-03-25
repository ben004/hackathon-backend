import { Transactions } from '@entity/transactions.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsType } from '@shared/utills';
import { filter } from 'lodash';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { TransactionListResponse } from '@shared/interface/transaction.interface';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions)
        private readonly transactionsRepository: Repository<Transactions>
    ) { }

    private responseObject (transactions: Transactions): any {
        const {id, transactionMadeOn, transactionAmount, transactionType, categoryId, source, currency, description , transactionMode} = transactions;
        return {
            id,
            transactionMadeOn,
            transactionAmount,
            transactionType,
            categoryName: categoryId.categoryName,
            source,
            currency,
            description,
            transactionMode
        }
    }

    // // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getTransactions (userId: number): Promise<TransactionListResponse> {
        try {
            const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
            const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');
            const transactions = await this.transactionsRepository.find({
                where: {
                    userId,
                    // transactionType: TransactionsType.DEBIT,
                    transactionMadeOn: Between(startOfMonth, endOfMonth)
                },
                relations: ['categoryId', 'userId']
            });
            const creditList = filter(transactions, { transactionType: TransactionsType.CREDIT });
            const debitList = filter(transactions, { transactionType: TransactionsType.DEBIT });
            return {
                list: debitList.map(transaction => this.responseObject(transaction)),
                monthExpenses: debitList.map(item => item.transactionAmount).reduce((prev, curr) => prev + curr, 0),
                monthIncome: creditList.map(item => item.transactionAmount).reduce((prev, curr) => prev + curr, 0)
            };
        } catch (error) {
            console.log(error)
        }
    }
}
