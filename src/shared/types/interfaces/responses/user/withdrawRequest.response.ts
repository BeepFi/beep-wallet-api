export interface IWithdrawalRequest {
    _id?: string;
    userId: string;
    amount: number;
    accountNumber: string;
    bank: string;
    status: string;
    reference: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export enum WithdrawalRequestStatus {
    PENDING = 'pending',
    COMPLETED = 'complete',
    FAILED = 'failed',
}