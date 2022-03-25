import { Transactions } from '@entity/transactions.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsType } from '@shared/utills';
import { identity } from 'lodash';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions)
        private readonly transactionsRepository: Repository<Transactions>
    ) { }

    private responseObject (transactions: Transactions): any {
        const {id, transactionMadeOn, transactionAmount, transactionType, userId, categoryId, source, currency, description , transactionMode} = transactions;
        return {
            id,
            transactionMadeOn,
            transactionAmount,
            transactionType,
            userId,
            categoryName: categoryId.categoryName,
            source,
            currency,
            description,
            transactionMode
        }
    }

    // // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getTransactions (userId: number): Promise<Transactions[]> {
        try {
            const transactions = await this.transactionsRepository.find({
                where: {
                    userId,
                    transactionType: TransactionsType.DEBIT
                },
                relations: ['categoryId', 'userId']
            })
            return transactions.map(transaction => this.responseObject(transaction));
        } catch (error) {
            console.log(error)
        }
    }
}
