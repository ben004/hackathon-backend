import { Transactions } from '@entity/transactions.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { identity } from 'lodash';
import { getConnection, Repository } from 'typeorm';

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
    async getTransactions (): Promise<Transactions[]> {
        try {
            const data = await getConnection()
            .getRepository(Transactions)
            .createQueryBuilder("transactions")
            .leftJoinAndSelect("transactions.categoryId", "categories")
            .getMany();
            return data.map(transaction => this.responseObject(transaction));
        } catch (error) {
            console.log(error)
        }
    }
}
