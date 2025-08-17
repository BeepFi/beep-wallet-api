import IUserAccountModel from "../../../../shared/services/database/user/Account/type";
import ITransactionModel from "../../../../shared/services/database/user/transaction/type";
import EncryptionInterface from "../../../../shared/services/encryption/type";
import { PaystackService } from "../../../../shared/services/paystack/paystack.service";
import { sendSms } from "../../../../shared/services/sms/termii";
import { TransactionStatus, TransactionTypeEnum } from "../../../../shared/types/interfaces/responses/user/transaction.response";
import { generateWhatsappPin, modifiedPhoneNumber } from "../../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
import { TokenFactoryClient } from "../../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../../shared/services/blockchain/blockchain-client-two/tx";

dotenv.config();


class TransferService {
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
        if (!checkUser.data) return msg.reply(`Unable to get your account`);

        if (!checkUser.data.requestWhatsappPin)  return msg.reply(`Please restart the transaction by sending start`);

        if (checkUser.data.whatsappPin != pin) return msg.reply(`Incorrect PIN`);

        const updateUserWhatsappPin = await this._userModel.updateAccount(phoneNumber, {requestWhatsappPin: false})
        if (!updateUserWhatsappPin.status) return msg.reply(`END Unable to carry out transaction`);

        return msg.reply(`Enter Amount`);
    }

    public enterAddress = async (msg: any) => {
        return msg.reply(`Enter wallet Address`);
    }

    public transfer = async (msg: any, phoneNumber: string, amount: string, address: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return msg.reply(`Unable to get your account`);
        const  {id} = checkUser.data

        console.log(1)

        const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

        const connectWallet = await this.tokenFactoryClient.connectWallet(mnemonic)

        const nativeTokenBal = await this.tokenFactoryClient.getNativeTokenBal(checkUser.data.publicKey)

        const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)
        const transferMsg = await this.beepTxClient.transfer(address, (parseFloat(amount) * 1000000).toString())
        console.log(11)
        const extimateGas = await this.tokenFactoryClient.estimateContractExecutionGas(mnemonic, transferMsg)
        console.log("extimateGas", extimateGas)
        console.log(12)

        console.log(2)
        if (!nativeTokenBal.status) return msg.reply(`Unable to carry out Transaction`);

        console.log(3)

        if (parseFloat(nativeTokenBal.balance as string) < 8750) {
            const coinMsg = await this.beepTxClient.coin('untrn', '5000')
            console.log(11)
            const adminConnectWallet = await this.tokenFactoryClient.connectWallet(process.env.ADMIN_MNEMONIC as string)
            console.log(12)
            const transferNativeToken = await this.tokenFactoryClient.sendNativeToken(adminConnectWallet.client, adminConnectWallet.sender, checkUser.data.publicKey, coinMsg )
            console.log(13)
            if (!transferNativeToken.status) return msg.reply(`Unable to carry out Transaction`);
            console.log(14)
        }

        console.log(4)


        console.log(5)

        const getBeepTokenBalance = await this.tokenFactoryClient.query(connectWallet.client, balanceMsg)
        if (!getBeepTokenBalance.status) return msg.reply(`Unable to carry out Transaction`);

        if ((getBeepTokenBalance.result.balance / 1000000) < parseFloat(amount)) return msg.reply(`Insufficient balance`);

        console.log(6)

        const transferToken = await this.tokenFactoryClient.tx(connectWallet.client, connectWallet.sender, transferMsg)
        if (!transferToken.status) return msg.reply(`Unable to create transaction`);

        const reference = this.generateUniqueCode()

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amount), reference: reference, type: TransactionTypeEnum.DEBIT, status: TransactionStatus.COMPLETED})

        console.log(7)

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

export default TransferService