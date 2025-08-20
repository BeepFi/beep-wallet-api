import { IWithdrawalRequest } from "../../interfaces/responses/user/withdrawRequest.response";

class WithdrawalRequestDto implements IWithdrawalRequest {
    public id?: string;
    public userId: string;
    public accountNumber: string;
    public bank: string;
    public amount: number ;
    public status: string;
    public reference: string;
    public updatedAt?: Date;
    public createdAt?: Date;
    
    constructor(userwithdrwalRequest: IWithdrawalRequest) {
      this.id = userwithdrwalRequest._id;
      this.userId = userwithdrwalRequest.userId;
      this.accountNumber = userwithdrwalRequest.accountNumber;
      this.bank = userwithdrwalRequest.bank;
      this.amount = userwithdrwalRequest.amount;
      this.status = userwithdrwalRequest.status;
      this.reference = userwithdrwalRequest.reference;
      this.updatedAt = userwithdrwalRequest.updatedAt;
      this.createdAt = userwithdrwalRequest.createdAt;

    }
  
    get getModel() {
      return {
        _id: this.id,
        userId: this.userId,
        accountNumber: this.accountNumber,
        bank: this.bank,
        amount: this.amount,
        status: this.status,
        reference: this.reference,
        updatedAt: this.updatedAt ? new Date(this.updatedAt): undefined,
        createdAt: this.createdAt ? new Date(this.createdAt): undefined,
      } as IWithdrawalRequest
    }

}

export default WithdrawalRequestDto;