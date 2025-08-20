import WithdrawalRequestDto from "../../../../types/dtos/user/withdrawalRequest.dto";
import { IWithdrawalRequest } from "../../../../types/interfaces/responses/user/withdrawRequest.response";


interface IWithdrawalRequestModel {
    createWithrawalRequestToDB: (details: Partial<IWithdrawalRequest>) => Promise<{status: boolean, error?: string | unknown, data?: WithdrawalRequestDto }>;

    checkIfExist: (details: Partial<IWithdrawalRequest>) => Promise<{status: boolean, error?: string | unknown, data?: WithdrawalRequestDto }>;

    updateWithrawalRequest: (id: string, details: Partial<IWithdrawalRequest>) => Promise<{status: boolean, error?: string | unknown, data?: WithdrawalRequestDto }>;
}

export default IWithdrawalRequestModel;