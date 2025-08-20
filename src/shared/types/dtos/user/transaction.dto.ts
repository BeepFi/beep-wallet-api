import { IUserTransaction, TransactionStatus, TransactionTypeEnum } from "../../interfaces/responses/user/transaction.response";

class TransactionDto implements IUserTransaction {
    public id?: string;
    public userId: string;
    public amount: number;
    public reference: string;
    public type: TransactionTypeEnum ;
    public status: TransactionStatus;
    public updatedAt?: Date;
    public createdAt?: Date;
    
    constructor(usertransaction: IUserTransaction) {
      this.id = usertransaction._id;
      this.userId = usertransaction.userId,
      this.amount = usertransaction.amount;
      this.reference = usertransaction.reference;
      this.type = usertransaction.type;
      this.status = usertransaction.status;
      this.updatedAt = usertransaction.updatedAt;
      this.createdAt = usertransaction.createdAt;

    }
  
    get getModel() {
      return {
        _id: this.id,
        userId: this.userId,
        amount: this.amount,
        reference: this.reference,
        type: this.type,
        status: this.status,
        updatedAt: this.updatedAt ? new Date(this.updatedAt): undefined,
        createdAt: this.createdAt ? new Date(this.createdAt): undefined,
      } as IUserTransaction
    }
  
}

export default TransactionDto;