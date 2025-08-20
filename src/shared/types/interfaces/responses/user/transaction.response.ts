export enum TransactionTypeEnum {
    CREDIT = 'credit',
    DEBIT = 'debit',
}
  
export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'complete',
    FAILED = 'failed',
}

export interface IUserTransaction {
    _id?: string;
    userId: string;
    amount: number;
    reference: string;
    type: TransactionTypeEnum;
    status: TransactionStatus;
    updatedAt?: Date;
    createdAt?: Date;
}