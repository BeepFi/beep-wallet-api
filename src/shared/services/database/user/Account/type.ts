import { IUserAccount } from "../../../../types/interfaces/responses/user/userAccount.response";
import UserAccountDto from "../../../../types/dtos/user/userAccount.dto";

interface IUserAccountModel {
    createAccountToDB: (details: Partial<IUserAccount>) => Promise<{status: boolean, error?: string | unknown, data?: UserAccountDto }>;

    checkIfExist: (details: Partial<IUserAccount>) => Promise<{status: boolean, error?: string | unknown, data?: UserAccountDto }>;

    updateAccount: (phoneNumber: string, details: Partial<IUserAccount>) => Promise<{status: boolean, error?: string | unknown, data?: UserAccountDto }>;
}

export default IUserAccountModel;