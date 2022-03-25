import { Transactions } from "@entity/transactions.entity";

export interface TransactionListResponse {
    list: Transactions[],
    monthExpenses: number,
    monthIncome: number,
}