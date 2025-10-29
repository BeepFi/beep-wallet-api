import { IUserAccount, Referral } from "../../interfaces/responses/user/userAccount.response";

class UserAccountDto implements IUserAccount {
    public id?: string;
    public phoneNumber: string;
    public pin: string;
    public publicKey: string ;
    public privateKey: string;
    public balance: number;
    evmPublicKey?: string | undefined;
    evmPrivateKey?: string | undefined;
    referrals: Referral[];
    whatsappPin?: string | undefined;
    requestWhatsappPin: boolean;
    public updatedAt?: Date;
    public createdAt?: Date;
    
    constructor(userAccount: IUserAccount) {
      this.id = userAccount._id;
      this.phoneNumber = userAccount.phoneNumber;
      this.pin = userAccount.pin;
      this.publicKey = userAccount.publicKey;
      this.privateKey = userAccount.privateKey;
      this.balance = userAccount.balance;
      this.evmPublicKey = userAccount.evmPublicKey;
      this.evmPrivateKey = userAccount.evmPrivateKey;
      this.referrals = userAccount.referrals;
      this.whatsappPin = userAccount.whatsappPin;
      this.requestWhatsappPin = userAccount.requestWhatsappPin;
      this.updatedAt = userAccount.updatedAt;
      this.createdAt = userAccount.createdAt;

    }
  
    get getModel() {
      return {
        _id: this.id,
        phoneNumber: this.phoneNumber,
        pin: this.pin,
        publicKey: this.publicKey,
        privateKey: this.privateKey,
        balance: this.balance,
        evmPublicKey: this.evmPublicKey,
        evmPrivateKey: this.evmPrivateKey,
        referrals: this.referrals,
        whatsappPin: this.whatsappPin,
        requestWhatsappPin: this.requestWhatsappPin,
        updatedAt: this.updatedAt ? new Date(this.updatedAt): undefined,
        createdAt: this.createdAt ? new Date(this.createdAt): undefined,
      } as IUserAccount
    }

    get getSecureRespons() {
        return {
          _id: this.id,
          phoneNumber: this.phoneNumber,
          publicKey: this.publicKey,
          balance: this.balance,
          evmPublicKey: this.evmPublicKey,
          referrals: this.referrals,
          updatedAt: this.updatedAt ? new Date(this.updatedAt): undefined,
          createdAt: this.createdAt ? new Date(this.createdAt): undefined,
        } as IUserAccount
      }
  
}

export default UserAccountDto;