import { Transactions } from '@entity/transactions.entity';
import { Users } from '@entity/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTransactionAmountFromMessage, getTransactionDate, getTransactionId, getTransactionModeFromMessage, getTransactionSourceAndDestination, getTransactionTypeFromMessage } from '@shared/helper/transactionsHelper';
import { TransactionsType } from '@shared/utills';
import { filter, isEmpty } from 'lodash';
import { Between, In, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { CategoriesListResponse, TransactionListResponse } from '@shared/interface/transaction.interface';
import { newTransactionDTO } from './dto/transaction.dto';
import { Categories } from '@entity/category.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions)
        private readonly transactionsRepository: Repository<Transactions>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
    ) { }

    private async validateAndGetUser (userId: string) {
        const user = await this.usersRepository.findOne({
            where: {
                cognito_id: userId
            }
        });
        if(isEmpty(user)){
           throw new HttpException("User not exist", HttpStatus.NOT_FOUND);
        }
        return user
    }

    private responseObject (transactions: Transactions): any {
        const {id, transactionMadeOn, transactionAmount, transactionType, categoryId, source, currency, description , transactionMode} = transactions;
        return {
            id,
            transactionMadeOn,
            transactionAmount,
            transactionType,
            categoryName: categoryId?.categoryName,
            source,
            currency,
            description,
            transactionMode
        }
    }

    private async getTransactionForMonth (month: string, userId: number, type: TransactionsType = null) {
        try {
            const startOfMonth = moment(month, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD');
            const endOfMonth   = moment(month, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
            const transactionList = await this.transactionsRepository.find({
                where: {
                    userId,
                    transactionMadeOn: Between(startOfMonth, endOfMonth),
                    transactionType: In(type ? [type] : [TransactionsType.CREDIT, TransactionsType.DEBIT])
                },
                relations: ['categoryId', 'userId']
            });
            return transactionList.map(transaction => this.responseObject(transaction))
        } catch (error) {
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getTransactions (cognitoId: string): Promise<TransactionListResponse> {  
        try {
            const user = await this.validateAndGetUser(cognitoId)
            const transactions = await this.getTransactionForMonth(moment().format('YYYY-MM-DD'), user.id);
            const creditList = filter(transactions, { transactionType: TransactionsType.CREDIT });
            const debitList = filter(transactions, { transactionType: TransactionsType.DEBIT });
            return {
                monthExpenses: debitList.map(debit => debit.transactionAmount).reduce((prev, curr) => prev + curr, 0),
                monthIncome: creditList.map(credit => credit.transactionAmount).reduce((prev, curr) => prev + curr, 0),
                list: transactions,
                user
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
            const userIdFromDb = await this.validateAndGetUser(userId)
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
            return {success: true, message: "Inserted successfully", insertedData};
        } catch (error) {
            console.log(error);
            throw new HttpException("Something went wrong!", HttpStatus.BAD_REQUEST);
        }
    }

    async getCategoriesForUserId(userId: string, date: string) {
        try {
            const user = await this.validateAndGetUser(userId)
            const categories = await this.categoriesRepository.find({
                where: {
                    isDeleted: false,
                }
            });
            const transactionListForDebit: Transactions[] = await this.getTransactionForMonth(date, user.id, TransactionsType.DEBIT);
            const totalAmount = transactionListForDebit.map(debit => debit.transactionAmount).reduce((prev, curr) => prev + curr, 0)
            const responseObj: CategoriesListResponse[] = categories.map((categorie: Categories) => {
                const { categoryName, id } = categorie;
                const categorieTransactionList: any = filter(transactionListForDebit, { categoryName });
                const categorieBasedTotalAmount = categorieTransactionList.map(debit => debit.transactionAmount).reduce((prev, curr) => prev + curr, 0)
                return {
                    id,
                    categoryName,
                    list: categorieTransactionList,
                    percentage: ((categorieBasedTotalAmount / totalAmount) * 100).toFixed(2)
                }
            });
    
            return responseObj;
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST)
        }
    }
}
