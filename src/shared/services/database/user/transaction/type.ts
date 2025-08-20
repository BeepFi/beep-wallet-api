import { IUserTransaction } from "../../../../types/interfaces/responses/user/transaction.response";
import TransactionDto from "../../../../types/dtos/user/transaction.dto";


interface ITransactionModel {
    createTransactionToDB: (details: Partial<IUserTransaction>) => Promise<{status: boolean, error?: string | unknown, data?: TransactionDto }>;

    checkIfExist: (details: Partial<IUserTransaction>) => Promise<{status: boolean, error?: string | unknown, data?: TransactionDto }>;

    updateTransation: (id: string, details: Partial<IUserTransaction>) => Promise<{status: boolean, error?: string | unknown, data?: TransactionDto }>;
}

export default ITransactionModel;