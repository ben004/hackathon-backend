import { Transactions } from '@entity/transactions.entity';
import { Users } from '@entity/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTransactionAmountFromMessage, getTransactionDate, getTransactionId, getTransactionModeFromMessage, getTransactionSourceAndDestination, getTransactionTypeFromMessage } from '@shared/helper/transactionsHelper';
import { TransactionsType } from '@shared/utills';
import { filter } from 'lodash';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { TransactionListResponse } from '@shared/interface/transaction.interface';
import { identity, isEmpty, get } from 'lodash';
import { newTransactionDTO } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions)
        private readonly transactionsRepository: Repository<Transactions>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
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

    async createTransaction (newTransaction: newTransactionDTO): Promise<Object> {
        try {
            const {
                message,
                userId
            } = newTransaction;
            const userIdFromDb = await this.usersRepository.findOne({
                where: {
                    cognito_id: userId
                }
            });
            if(isEmpty(userIdFromDb)){
               //When no user_id is there in db 
               throw new HttpException("No user id associated", HttpStatus.NOT_FOUND);
            }
            const lowerCaseMessage = message.toLowerCase();
            const lowerCasemessageArray = lowerCaseMessage.split(' ');
            console.log(lowerCasemessageArray);
            //TODO: Set currency dynamically
            const currency = 'INR';
            const transactionAmount = getTransactionAmountFromMessage(lowerCasemessageArray);
            const transactionType = getTransactionTypeFromMessage(lowerCasemessageArray);
            const transactionMode = getTransactionModeFromMessage(lowerCasemessageArray);
            const transactionMadeOn = getTransactionDate(lowerCasemessageArray);
            const {transactionSource ,transactionDestination} = getTransactionSourceAndDestination(lowerCasemessageArray, transactionType,transactionMode);
            const transactionId = getTransactionId(lowerCasemessageArray);
            //TODO: Get category_id from category_key_word using the destination of the transaction
            const transaction = new Transactions;
            transaction.userId = userIdFromDb;
            transaction.transactionId = transactionId;
            transaction.currency = currency;
            transaction.destination = transactionDestination;
            transaction.source = transactionSource;
            transaction.transactionType = transactionType;
            transaction.transactionAmount = transactionAmount;
            transaction.transactionMadeOn = transactionMadeOn;
            transaction.transactionMode = transactionMode;
            const insertedData = await this.transactionsRepository.save(transaction);
            console.log(insertedData);
            return {success: true, message: "Inserted successfully", insertedData};
        } catch (error) {
            console.log(error);
            throw new HttpException("Something went wrong!", HttpStatus.BAD_REQUEST);
        }
    }
}
