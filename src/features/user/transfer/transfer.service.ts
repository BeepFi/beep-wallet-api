import IUserAccountModel from "../../../shared/services/database/user/Account/type";
import ITransactionModel from "../../../shared/services/database/user/transaction/type";
import EncryptionInterface from "../../../shared/services/encryption/type";
import { PaystackService } from "../../../shared/services/paystack/paystack.service";
import { sendSms } from "../../../shared/services/sms/termii";
import { TransactionStatus, TransactionTypeEnum } from "../../../shared/types/interfaces/responses/user/transaction.response";
import { modifiedPhoneNumber } from "../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
import { TokenFactoryClient } from "../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../shared/services/blockchain/blockchain-client-two/tx";

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

    public start = async () => {
        return `CON Enter PIN `;
    }

    public verifyUser = async (phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
        if (!veryPin) return `END Incorrect PIN`;

        return `CON Enter Amount`;
    }

    public enterAddress = async () => {
        return `CON Enter wallet Address `;
    }

    public transfer = async (phoneNumber: string, amount: string, address: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;
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
        if (!nativeTokenBal.status) return `END Unable to carry out Transaction`;

        console.log(3)

        if (parseFloat(nativeTokenBal.balance as string) < 8750) {
            const coinMsg = await this.beepTxClient.coin('untrn', '5000')
            console.log(11)
            const adminConnectWallet = await this.tokenFactoryClient.connectWallet(process.env.ADMIN_MNEMONIC as string)
            console.log(12)
            const transferNativeToken = await this.tokenFactoryClient.sendNativeToken(adminConnectWallet.client, adminConnectWallet.sender, checkUser.data.publicKey, coinMsg )
            console.log(13)
            if (!transferNativeToken.status) return `END Unable to carry out Transaction`;
            console.log(14)
        }

        console.log(4)


        console.log(5)

        const getBeepTokenBalance = await this.tokenFactoryClient.query(connectWallet.client, balanceMsg)
        if (!getBeepTokenBalance.status) return `END Unable to carry out Transaction`;

        if ((getBeepTokenBalance.result.balance / 1000000) < parseFloat(amount)) return `END Insufficient balance`;

        console.log(6)

        const transferToken = await this.tokenFactoryClient.tx(connectWallet.client, connectWallet.sender, transferMsg)
        if (!transferToken.status) return `END Unable to create transaction`;

        const reference = this.generateUniqueCode()

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amount), reference: reference, type: TransactionTypeEnum.DEBIT, status: TransactionStatus.COMPLETED})

        console.log(7)

        return `END Transaction in progress`;
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