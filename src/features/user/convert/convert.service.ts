import IUserAccountModel from "../../../shared/services/database/user/Account/type";
import ITransactionModel from "../../../shared/services/database/user/transaction/type";
import EncryptionInterface from "../../../shared/services/encryption/type";
import { PaystackService } from "../../../shared/services/paystack/paystack.service";
import { sendSms } from "../../../shared/services/sms/termii";
import { TransactionStatus, TransactionTypeEnum } from "../../../shared/types/interfaces/responses/user/transaction.response";
import { modifiedPhoneNumber } from "../../../shared/constant/mobileNumberFormatter";
import { TokenFactoryClient } from "../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../shared/services/blockchain/blockchain-client-two/tx";
import { BeepContractClient } from "../../../shared/services/blockchain/smart-contract-client/mono-chain-beep";
import dotenv from "dotenv";

dotenv.config();

class ConvertService {
    private _userModel: IUserAccountModel
    private _transactionModel: ITransactionModel
    private _encryptionRepo: EncryptionInterface
    private paystackService = new PaystackService()
    // private tokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_CONTRACT_ADDRESS as string)
    private ngnTokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_NGN_CONTRACT_ADDRESS as string)
    private atomTokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string)
    private beepTxClient = new BeepTxClient()
    private beepContractClient = new BeepContractClient( process.env.BEEP_CONTRACT_ADDRESS as string, process.env.RPC as string,)

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

        return `CON Select Token 
        1. ATOM`;
    }

    public enterAmountIn = async () => {
        return `CON Enter Amount In`;
    }


    public enterAmountOut = async () => {
        return `CON Enter Amount Out`;
    }

    public convertBNGNToBToken = async (phoneNumber: string, amountIn: string, amountOut: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        console.log(1)

        const  {id} = checkUser.data

        const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

        const connectWallet = await this.ngnTokenFactoryClient.connectWallet(mnemonic)

        console.log(2)

        const nativeTokenBal = await this.ngnTokenFactoryClient.getNativeTokenBal(checkUser.data.publicKey)
        if (!nativeTokenBal.status) return `END Unable to carry out Transaction`;

        console.log(3)

        if (parseFloat(nativeTokenBal.balance as string) < 32434) {
            console.log(11)
            const coinMsg = await this.beepTxClient.coin('untrn', '52434')
            const adminConnectWallet = await this.ngnTokenFactoryClient.connectWallet(process.env.ADMIN_MNEMONIC as string)
            console.log(12)
            const transferNativeToken = await this.ngnTokenFactoryClient.sendNativeToken(adminConnectWallet.client ,adminConnectWallet.sender, checkUser.data.publicKey, coinMsg )
            console.log(13)
            if (!transferNativeToken.status) return `END Unable to carry out Transaction`;
            console.log(14)
        }

        console.log(4)

        const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)

        const getBeepTokenBalance = await this.ngnTokenFactoryClient.query(connectWallet.client, balanceMsg)
        if (!getBeepTokenBalance.status) return `END Unable to carry out Transaction`;

        console.log(5)

        if ((getBeepTokenBalance.result.balance) < parseFloat(amountIn)) return `END Insufficient balance`;

        console.log(6)


        const reference = this.generateUniqueCode()

        const connectBeepContractClient = await this.beepContractClient.connect(mnemonic)

        console.log(7)

        const createAllowance = await this.beepContractClient.increaseAllowance(
            process.env.TOKEN_NGN_CONTRACT_ADDRESS as string,
            process.env.BEEP_CONTRACT_ADDRESS as string,
            "500"
        )
        console.log(8)
        if (!createAllowance.status) return `END Unable to create transaction`;

        // const createAllowanceTwo = await this.beepContractClient.increaseAllowance(
        //     process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string,
        //     process.env.BEEP_CONTRACT_ADDRESS as string,
        //     "500"
        // )
        // console.log(82)
        // if (!createAllowanceTwo.status) return `END Unable to create transaction`;

        console.log(83)

        const createIntent = await this.beepContractClient.createIntent(
            [{ 
                token: process.env.TOKEN_NGN_CONTRACT_ADDRESS as string,
                amount: amountIn,
                is_native: false
            }],
            [{
                token: process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string,
                amount: amountOut,
                is_native: false,
                target_address: undefined
            }],
            { 
                token: process.env.TOKEN_NGN_CONTRACT_ADDRESS as string,
                amount: "1",
                is_native: false
            },
            undefined,
            []
        )

        console.log(10)

        if (!createIntent.status) return `END Unable to create transaction`;

        console.log(101)

        console.log('createIntent', createIntent.result)

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amountIn), reference: reference, type: TransactionTypeEnum.DEBIT, status: TransactionStatus.PENDING})
        if (!newTransaction.data)  return `END Unable to create transaction`;

        console.log(102)

        return `END Transaction in progress`;
    }

    public convertBTokenToBNGN = async (phoneNumber: string, amountIn: string, amountOut: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        console.log(1)

        const  {id} = checkUser.data

        const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

        const connectWallet = await this.atomTokenFactoryClient.connectWallet(mnemonic)

        console.log(2)

        const nativeTokenBal = await this.atomTokenFactoryClient.getNativeTokenBal(checkUser.data.publicKey)
        if (!nativeTokenBal.status) return `END Unable to carry out Transaction`;

        console.log(3)

        if (parseFloat(nativeTokenBal.balance as string) < 32434) {
            console.log(11)
            const coinMsg = await this.beepTxClient.coin('untrn', '62434')
            const adminConnectWallet = await this.atomTokenFactoryClient.connectWallet(process.env.ADMIN_MNEMONIC as string)
            console.log(12)
            const transferNativeToken = await this.atomTokenFactoryClient.sendNativeToken(adminConnectWallet.client ,adminConnectWallet.sender, checkUser.data.publicKey, coinMsg )
            console.log(13)
            if (!transferNativeToken.status) return `END Unable to carry out Transaction`;
            console.log(14)
        }

        console.log(4)
        const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)

        const getBeepTokenBalance = await this.atomTokenFactoryClient.query(connectWallet.client, balanceMsg)
        if (!getBeepTokenBalance.status) return `END Unable to carry out Transaction`;

        console.log(5)

        if ((getBeepTokenBalance.result.balance) < parseFloat(amountIn)) return `END Insufficient balance`;


        const reference = this.generateUniqueCode()

        const connectBeepContractClient = await this.beepContractClient.connect(mnemonic)

        console.log(51)

        const createAllowance = await this.beepContractClient.increaseAllowance(
            process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string,
            process.env.BEEP_CONTRACT_ADDRESS as string,
            amountIn
        )
        console.log(6)
        if (!createAllowance.status) return `END Unable to create transaction`;

        console.log(7)

        const createIntent = await this.beepContractClient.createIntent(
            [{ 
                token: process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string,
                amount: amountIn,
                is_native: false
            }],
            [{
                token: process.env.TOKEN_NGN_CONTRACT_ADDRESS as string,
                amount: amountOut,
                is_native: false,
                target_address: undefined
            }],
            { 
                token: process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string,
                amount: "1",
                is_native: false
            },
            undefined,
            []
        )

        console.log(8)

        if (!createIntent.status) return `END Unable to create transaction`;

        console.log('createIntent', createIntent.result)

        console.log(9)

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amountIn), reference: reference, type: TransactionTypeEnum.DEBIT, status: TransactionStatus.PENDING})
        if (!newTransaction.data)  return `END Unable to create transaction`;

        console.log(10)

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

export default ConvertService