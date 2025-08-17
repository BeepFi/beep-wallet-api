import IUserAccountModel from "../../../../shared/services/database/user/Account/type";
import ITransactionModel from "../../../../shared/services/database/user/transaction/type";
import EncryptionInterface from "../../../../shared/services/encryption/type";
import { PaystackService } from "../../../../shared/services/paystack/paystack.service";
import { sendSms } from "../../../../shared/services/sms/termii";
import { TransactionStatus, TransactionTypeEnum } from "../../../../shared/types/interfaces/responses/user/transaction.response";
import { modifiedPhoneNumber, generateWhatsappPin } from "../../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
import { TokenFactoryClient } from "../../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../../shared/services/blockchain/blockchain-client-two/tx";

dotenv.config();

class DepositService {
    private _userModel: IUserAccountModel
    private _transactionModel: ITransactionModel
    private _encryptionRepo: EncryptionInterface
    private paystackService = new PaystackService()
    private tokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_CONTRACT_ADDRESS as string)
    private beepTxClient = new BeepTxClient()

    constructor({userModel, transactionModel, encryptionRepo}: {
        userModel: IUserAccountModel;
        transactionModel: ITransactionModel;
        encryptionRepo: EncryptionInterface
    }){
        this._userModel = userModel
        this._transactionModel = transactionModel
        this._encryptionRepo = encryptionRepo
    }

    public start = async (msg: any, phoneNumber: string,) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return msg.reply(`END Unable to get your account`);

        const whatsappPin = generateWhatsappPin();

        const updateUserWhatsappPin = await this._userModel.updateAccount(phoneNumber, {whatsappPin, requestWhatsappPin: true})
        if (!updateUserWhatsappPin.status) return msg.reply(`END Unable to carry out transaction`);

        let mobileNumber = modifiedPhoneNumber(phoneNumber);

        const text = `Hello dear, use this number ${whatsappPin} to verify ur Transaction on Whatsapp`

        sendSms(mobileNumber, text)

        return msg.reply(`Enter Pin sent to your phone number to continue this transaction`)
   
    }



    public verifyUser = async (msg: any, phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return  msg.reply(`Unable to get your account`);

        if (!checkUser.data.requestWhatsappPin)  return msg.reply(`Please restart the transaction by sending start`);

        if (checkUser.data.whatsappPin != pin) return msg.reply(`Incorrect PIN`);

        const updateUserWhatsappPin = await this._userModel.updateAccount(phoneNumber, {requestWhatsappPin: false})
        if (!updateUserWhatsappPin.status) return msg.reply(`END Unable to carry out transaction`);

        return msg.reply(`Enter Amount`);
    }

    public initializeDeposit = async (msg: any, phoneNumber: string, amount: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return msg.reply(`Unable to get your account`);

        const  {id} = checkUser.data

        const initDeposit = await this.paystackService.initTransaction('akinyemisaheedwale@gmail.com', parseFloat(amount), id!)
        if (!initDeposit.status) return msg.reply(`${initDeposit.message}`);

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amount), reference: initDeposit.data?.reference, type: TransactionTypeEnum.CREDIT, status: TransactionStatus.PENDING})
        if (!newTransaction.data)  return msg.reply(`Unable to create transaction`);

        let mobileNumber = modifiedPhoneNumber(phoneNumber);

        const text = `Hello dear, use this link ${initDeposit.data?.url} to complete your transaction and enter this Pin ${initDeposit.data?.reference} to complete and verify your transaction`

        console.log('text', text)

        // sendSms(mobileNumber, text)

        return msg.reply(`${text}`);
    }

    // public enterreference = async (msg: any) => {
    //     return `CON Enter reference code `;
    // }

    public verifyDeposit = async (msg: any, phoneNumber: string, reference: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return msg.reply(`Unable to get your account`);

        const  {id} = checkUser.data

        const checkTransaction = await this._transactionModel.checkIfExist({reference})
        if (!checkTransaction.data) return msg.reply(`No transaction found`);

        if (checkTransaction.data.status == TransactionStatus.PENDING) {

            const verifyDeposit = await this.paystackService.verifyTransaction(reference)
            if (!verifyDeposit.status) return msg.reply(`${verifyDeposit.message}`);

            const updateTransactionStatus = await this._transactionModel.updateTransation(checkTransaction.data.id!, {status: TransactionStatus.COMPLETED})
            if (!updateTransactionStatus.data)  return msg.reply(`Unable to update transaction`);

            // const newBalance = checkUser.data.balance + checkTransaction.data.amount

            // const updateBalance = await this._userModel.updateAccount(phoneNumber, {balance: newBalance})
            // if (!updateBalance.data) return `END Unable to verify Transaction`;

            const adminMnemonic =  process.env.ADMIN_MNEMONIC as string 

            const adminConnectWallet = await this.tokenFactoryClient.connectWallet(adminMnemonic)
    
            const mintMsg = await this.beepTxClient.mint(checkUser.data.publicKey, (updateTransactionStatus.data.amount * 1000000).toString())
    
            const mintToken = await this.tokenFactoryClient.tx(adminConnectWallet.client, adminConnectWallet.sender,  mintMsg)
            if (!mintToken.status) return msg.reply(`Unable to carry out Transaction`);

            return msg.reply(`Transaction verified successfully and completed`);
        }else{
            return msg.reply(`Unable to verify transaction or transaction already Verified`);
        }
    }
}

export default DepositService