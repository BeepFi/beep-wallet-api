import IUserAccountModel from "../../../../shared/services/database/user/Account/type";
import EncryptionInterface from "../../../../shared/services/encryption/type";
import { sendSms } from "../../../../shared/services/sms/termii";
import { generateWhatsappPin, modifiedPhoneNumber } from "../../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
// import BlockchainAccount from "../../../shared/services/blockchain/account";
import { TokenFactoryClient } from "../../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../../shared/services/blockchain/blockchain-client-two/tx";
import { BigNumber } from "bignumber.js";

dotenv.config();

class AuthService {
    private _userModel: IUserAccountModel
    private _encryptionRepo: EncryptionInterface

    private tokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_CONTRACT_ADDRESS as string)
    private atomTokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string)
    private beepTxClient = new BeepTxClient()

    constructor({userModel, encryptionRepo}: {
        userModel: IUserAccountModel;
        encryptionRepo: EncryptionInterface
    }){
        this._userModel = userModel
        this._encryptionRepo = encryptionRepo
    }

    public start = async (msg: any, phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})

        if (!checkUser.status) {
            const blockChainAccount = await this.tokenFactoryClient.createAccount()
            const publicKey = blockChainAccount.publicKey
            const privateKey = this._encryptionRepo.encryptToken(blockChainAccount.mnemonic, process.env.ENCRYTION_KEY as string )
            
            const createAccount = await this._userModel.createAccountToDB({phoneNumber, publicKey, privateKey})

            // if (!createAccount.data)  return `END Unable to create account`;

            return msg.reply(`
                1. Deposit Naira \n
                2. Transfer Crypto \n
                3. Withdraw Naira \n
                4. Convert Naira to Crypto \n
                5. Convert Crypto to Naira \n
                6. Get Balance \n
                7. Refer User \n
                0. Back
            `)

        }else{
            return msg.reply(`
                1. Deposit Naira \n
                2. Transfer Crypto \n
                3. Withdraw Naira \n
                4. Convert Naira to Crypto \n
                5. Convert Crypto to Naira \n
                6. Get Balance \n
                7. Refer User \n
                0. Back
            `)
        }
    }

    public enterPin = async (msg: any, phoneNumber: string,) => {
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

    // public verifyUser = async (phoneNumber: string, pin: string) => {
    //     const checkUser = await this._userModel.checkIfExist({phoneNumber})
    //     if (!checkUser.data) return `END Unable to get your account`;

    //     const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
    //     if (!veryPin) return `END Incorrect PIN`;

    //     return `CON Enter Amount`;
    // }

    

    public getBalance = async (msg: any, phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return msg.reply(`Unable to get your account`);

        if (!checkUser.data.requestWhatsappPin)  return msg.reply(`Please restart the transaction by sending start`);

        if (checkUser.data.whatsappPin != pin) return msg.reply(`Incorrect PIN`);

        const updateUserWhatsappPin = await this._userModel.updateAccount(phoneNumber, {requestWhatsappPin: false})
        if (!updateUserWhatsappPin.status) return msg.reply(`END Unable to carry out transaction`);

        //get the real bToken balance from blockchain
        const nativeTokenBalance = await this.tokenFactoryClient.getNativeTokenBal(checkUser.data.publicKey)

        const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

        const nairaConnectWallet = await this.tokenFactoryClient.connectWallet(mnemonic)

        const atomConnectWallet = await this.atomTokenFactoryClient.connectWallet(mnemonic)

        const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)

        const tokenInfoMsg = await this.beepTxClient.tokeInfo()

        const nairaTokenInfo =await this.tokenFactoryClient.query(nairaConnectWallet.client, tokenInfoMsg)
        if (!nairaTokenInfo.status) return msg.reply(`Unable to get balance`);

        const atomTokenInfo =await this.atomTokenFactoryClient.query(atomConnectWallet.client, tokenInfoMsg)
        if (!atomTokenInfo.status) return msg.reply(`Unable to get balance`);

        const nairaDecimal = nairaTokenInfo.result.decimals
        const atomDecimal = atomTokenInfo.result.decimals

        const nairaTokenBalance = await this.tokenFactoryClient.query(nairaConnectWallet.client, balanceMsg)
        if (!nairaTokenBalance.status) return msg.reply(`Unable to get balance`);

        const atomTokenBalance = await this.atomTokenFactoryClient.query(atomConnectWallet.client, balanceMsg)
        if (!atomTokenBalance.status) return msg.reply(`Unable to get balance`);

        const nairaMicroAmount = new BigNumber(nairaTokenBalance.result.balance)
        const atomMicroAmount = new BigNumber(atomTokenBalance.result.balance);

        const nairaTokenAmount = nairaMicroAmount.dividedBy(new BigNumber(10).pow(nairaDecimal)).toString();
        const atomTokenAmount = atomMicroAmount.dividedBy(new BigNumber(10).pow(atomDecimal)).toString();

        let mobileNumber = modifiedPhoneNumber(phoneNumber);

        const text = `NGN Balance: ${nairaTokenAmount}, ATOM Balance: ${atomTokenAmount}`

        sendSms(mobileNumber, text)

        return msg.reply(`NGN Balance: ${nairaTokenAmount}
        ATOM Balance: ${atomTokenAmount}`);
    }


}

export default AuthService;