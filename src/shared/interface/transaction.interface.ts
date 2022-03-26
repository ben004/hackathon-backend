import { Transactions } from "@entity/transactions.entity";
import { Users } from "@entity/user.entity";

export interface TransactionListResponse {
    list: Transactions[],
    monthExpenses: number,
    monthIncome: number,
    user: Users,
}

export interface CategoriesListResponse {
    list: Transactions[],
    categoryName: string,
    id: number,
    percentage: string,
    total: number,
}
