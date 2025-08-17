import IUserAccountModel from "../../../../shared/services/database/user/Account/type";
import ITransactionModel from "../../../../shared/services/database/user/transaction/type";
import IWithdrawalRequestModel from "../../../../shared/services/database/user/withdrawalRequest/type";
import EncryptionInterface from "../../../../shared/services/encryption/type";
import { PaystackService } from "../../../../shared/services/paystack/paystack.service";
import { sendSms } from "../../../../shared/services/sms/termii";
import { TransactionStatus, TransactionTypeEnum } from "../../../../shared/types/interfaces/responses/user/transaction.response";
import { generateWhatsappPin, modifiedPhoneNumber } from "../../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
import { TokenFactoryClient } from "../../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../../shared/services/blockchain/blockchain-client-two/tx";
import { WithdrawalRequestStatus } from "../../../../shared/types/interfaces/responses/user/withdrawRequest.response";

dotenv.config();


class WithdrawalService {
    private _userModel: IUserAccountModel
    private _transactionModel: ITransactionModel
    private _withdrawalRequestModel: IWithdrawalRequestModel
    private _encryptionRepo: EncryptionInterface
    private paystackService = new PaystackService()
    private tokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_CONTRACT_ADDRESS as string)
    private beepTxClient = new BeepTxClient()

    constructor({userModel, transactionModel, withdrawalRequestModel, encryptionRepo}: {
        userModel: IUserAccountModel;
        transactionModel: ITransactionModel;
        withdrawalRequestModel: IWithdrawalRequestModel;
        encryptionRepo: EncryptionInterface
    }){
        this._userModel = userModel
        this._transactionModel = transactionModel
        this._withdrawalRequestModel = withdrawalRequestModel
        this._encryptionRepo = encryptionRepo
    }

    public start = async (msg: any, phoneNumber: string) => {
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
        if (!checkUser.data) return msg.reply(`Unable to get your account`);

        if (!checkUser.data.requestWhatsappPin)  return msg.reply(`Please restart the transaction by sending start`);

        if (checkUser.data.whatsappPin != pin) return msg.reply(`Incorrect PIN`);

        const updateUserWhatsappPin = await this._userModel.updateAccount(phoneNumber, {requestWhatsappPin: false})
        if (!updateUserWhatsappPin.status) return msg.reply(`END Unable to carry out transaction`);

        return msg.reply(`Enter Amount`);
    }

    public enterAccountNumber = async (msg: any) => {
        return msg.reply(`Enter Account Number`);
    }

    public enterBankName = async (msg: any) => {
        return msg.reply(`Enter Bank Name`);
    }

    public withdraw = async (msg: any, phoneNumber: string, amount: string, accountNumber: string, bank: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return msg.reply(`Unable to get your account`);

        // if (checkUser.data.balance < parseFloat(amount)) return `END Insufficient bNGN balance`;

        const  {id} = checkUser.data

        const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

        const connectWallet = await this.tokenFactoryClient.connectWallet(mnemonic)

        const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)
        const burnMsg = await this.beepTxClient.burn((parseFloat(amount) * 1000000).toString())

        const getBeepTokenBalance = await this.tokenFactoryClient.query(connectWallet.client, balanceMsg)
        if (!getBeepTokenBalance.status) return msg.reply(`Unable to carry out Transaction`);

        console.log('one', getBeepTokenBalance.result.balance / 1000000)

        console.log('two', parseFloat(amount))

        if ((getBeepTokenBalance.result.balance / 1000000) < parseFloat(amount)) return msg.reply(`Insufficient balance`);

        const burnBeepToken = await this.tokenFactoryClient.tx(connectWallet.client, connectWallet.sender, burnMsg)
        if (!burnBeepToken.status) return msg.reply(` Unable to perform transaction`);


        const reference = this.generateUniqueCode()

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amount), reference: reference, type: TransactionTypeEnum.DEBIT, status: TransactionStatus.PENDING})
        if (!newTransaction.data)  return msg.reply(`Unable to create transaction`);

        const newWithdrawalRequest = await this._withdrawalRequestModel.createWithrawalRequestToDB({userId: id, amount: parseFloat(amount), bank: bank, accountNumber: accountNumber, reference: reference, status: WithdrawalRequestStatus.PENDING})
        if (!newWithdrawalRequest.data)  return msg.reply(`Unable to create transaction`);
 

        return msg.reply(`Transaction in progress`);
    }

     generateUniqueCode() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0'); // 2-digit day
        const minutes = String(now.getMinutes()).padStart(2, '0'); // 2-digit minutes
        const ms = String(now.getMilliseconds()).slice(-1); // Last digit of milliseconds
    
        return `${day}${minutes}${ms}`; // Example: "27154"
    }
}

export default WithdrawalService