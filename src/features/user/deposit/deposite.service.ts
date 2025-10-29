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
import EvmRepository from "../../../shared/services/blockchain/evm-chains/index";

dotenv.config();

class DepositService {
    private _userModel: IUserAccountModel
    private _transactionModel: ITransactionModel
    private _encryptionRepo: EncryptionInterface
    private paystackService = new PaystackService()
    private tokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_CONTRACT_ADDRESS as string)
    private beepTxClient = new BeepTxClient()
    private evmRepository = new EvmRepository()

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

    public selectionChain = async (phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        return `CON Select Chain
        1. Cosmos
        2. Hedera`;
    }

    public enterreference = async () => {
        return `CON Enter reference code `;
    }

    public verifyUser = async (phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
        if (!veryPin) return `END Incorrect PIN`;

        return `CON Enter Amount`;
    }

    // public enterAmount = async (phoneNumber: string,) => {
    //     const checkUser = await this._userModel.checkIfExist({phoneNumber})
    //     if (!checkUser.data) return `END Unable to get your account`;

    //     return `CON Enter Amount`;
    // }


    public initializeDeposit = async (phoneNumber: string, amount: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const  {id} = checkUser.data

        const initDeposit = await this.paystackService.initTransaction('akinyemisaheedwale@gmail.com', parseFloat(amount), id!)
        if (!initDeposit.status) return `END ${initDeposit.message}`;

        const newTransaction = await this._transactionModel.createTransactionToDB({userId: id, amount: parseFloat(amount), reference: initDeposit.data?.reference, type: TransactionTypeEnum.CREDIT, status: TransactionStatus.PENDING})
        if (!newTransaction.data)  return `END Unable to create transaction`;

        let mobileNumber = modifiedPhoneNumber(phoneNumber);

        const text = `Hello dear, use this link ${initDeposit.data?.url} to complete your transaction and also use this Pin ${initDeposit.data?.reference} to verify your transaction`

        console.log('text', text)

        sendSms(mobileNumber, text)

        return `END  Dear Customer, you will receive an SMS with link for payment and reference code for verification shortly`;
    }

    public verifyCosmosDeposit = async (phoneNumber: string, reference: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const  {id} = checkUser.data

        const checkTransaction = await this._transactionModel.checkIfExist({reference})
        if (!checkTransaction.data) return `END No transaction found`;

        if (checkTransaction.data.status == TransactionStatus.PENDING) {

            const verifyDeposit = await this.paystackService.verifyTransaction(reference)
            if (!verifyDeposit.status) return `END ${verifyDeposit.message}`;

            const updateTransactionStatus = await this._transactionModel.updateTransation(checkTransaction.data.id!, {status: TransactionStatus.COMPLETED})
            if (!updateTransactionStatus.data)  return `END Unable to update transaction`;

            // const newBalance = checkUser.data.balance + checkTransaction.data.amount

            // const updateBalance = await this._userModel.updateAccount(phoneNumber, {balance: newBalance})
            // if (!updateBalance.data) return `END Unable to verify Transaction`;

            const adminMnemonic =  process.env.ADMIN_MNEMONIC as string 

            const adminConnectWallet = await this.tokenFactoryClient.connectWallet(adminMnemonic)
    
            const mintMsg = await this.beepTxClient.mint(checkUser.data.publicKey, (updateTransactionStatus.data.amount * 1000000).toString())
    
            const mintToken = await this.tokenFactoryClient.tx(adminConnectWallet.client, adminConnectWallet.sender,  mintMsg)
            if (!mintToken.status) return `END Unable to carry out Transaction`;

            return `END Transaction verified successfully`;
        }else{
            return `END Unable to verify transaction or transaction already Verified`;
        }
    }

    public verifyHederaDeposit = async (phoneNumber: string, reference: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const  {id} = checkUser.data

        const checkTransaction = await this._transactionModel.checkIfExist({reference})
        if (!checkTransaction.data) return `END No transaction found`;

        if (checkTransaction.data.status == TransactionStatus.PENDING) {

            const verifyDeposit = await this.paystackService.verifyTransaction(reference)
            if (!verifyDeposit.status) return `END ${verifyDeposit.message}`;

            const updateTransactionStatus = await this._transactionModel.updateTransation(checkTransaction.data.id!, {status: TransactionStatus.COMPLETED})
            if (!updateTransactionStatus.data)  return `END Unable to update transaction`;

            const evmPrivateKey = checkUser.data.evmPrivateKey;
            const evmPublicKey = checkUser.data.evmPublicKey;

    
            const mintToken = await this.evmRepository.mint({address: evmPublicKey!, private_key:  process.env.MINT_PRIVATE_KEY!, amount: updateTransactionStatus.data.amount, contractAddress: process.env.NGN_TOKEN_HEDERA_CONTRACT!})
            if (!mintToken.status) return `END Unable to carry out Transaction`;

            return `END Transaction verified successfully`;
        }else{
            return `END Unable to verify transaction or transaction already Verified`;
        }
    }
}

export default DepositService