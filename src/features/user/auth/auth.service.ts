import IUserAccountModel from "../../../shared/services/database/user/Account/type";
import EncryptionInterface from "../../../shared/services/encryption/type";
import { sendSms } from "../../../shared/services/sms/termii";
import { modifiedPhoneNumber } from "../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
// import BlockchainAccount from "../../../shared/services/blockchain/account";
import { TokenFactoryClient } from "../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../shared/services/blockchain/blockchain-client-two/tx";
import { BigNumber } from "bignumber.js";
import EvmRepository from "../../../shared/services/blockchain/evm-chains/index";

dotenv.config();

class AuthService {
    private _userModel: IUserAccountModel
    private _encryptionRepo: EncryptionInterface

    private tokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_CONTRACT_ADDRESS as string)
    private atomTokenFactoryClient = new TokenFactoryClient(process.env.RPC as string, process.env.TOKEN_ATOM_CONTRACT_ADDRESS as string)
    private beepTxClient = new BeepTxClient()
    private evmRepository = new EvmRepository()

    constructor({userModel, encryptionRepo}: {
        userModel: IUserAccountModel;
        encryptionRepo: EncryptionInterface
    }){
        this._userModel = userModel
        this._encryptionRepo = encryptionRepo
    }

    public start = async (phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.status) {
            return `CON Carrier info
            11. Create account
            0. Exist
            `;
        }

        if (!checkUser.data?.pin) {
            return `CON Carrier info
            12. Create pin
            0. Back`;
        }

        if (phoneNumber == "+2348104322128") {
            return `CON Carrier info
            1. Deposit Naira
            2. Transfer Crypto
            3. Withdraw Naira
            4. Verify Deposit 
            5. Convert Naira to Crypto
            6. Convert Crypto to Naira
            7. Get Balance
            8. Refer User
            9. Total user
            0. Back`;
        }else{
            return `CON Carrier info
            1. Deposit Naira
            2. Transfer Crypto
            3. Withdraw Naira
            4. Verify Deposit 
            5. Convert Naira to Crypto
            6. Convert Crypto to Naira
            7. Get Balance
            8. Refer User
            13. Refer User
            0. Back`;
        }
    }

    public createAccount = async (phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (checkUser.data) return `END You already have account`;

        const blockChainAccount = await this.tokenFactoryClient.createAccount()
        const publicKey = blockChainAccount.publicKey
        const privateKey = this._encryptionRepo.encryptToken(blockChainAccount.mnemonic, process.env.ENCRYTION_KEY as string )

        const evmChainAccount = this.evmRepository.createWallet()
        if (!evmChainAccount.status) return `END Unable to create account`;
        
        const evmPublicKey = evmChainAccount.address
        const evmPrivateKey = evmChainAccount.private_key
        
        const createAccount = await this._userModel.createAccountToDB({phoneNumber, publicKey, privateKey, evmPublicKey, evmPrivateKey})
        if (!createAccount.data)  return `END Unable to create account`;

        return `CON Carrier info
        1. Create pin
        0. Back`;
    }

    public enterPin = async () => {
        return `CON Enter PIN`;
    }

    public verifyUser = async (phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
        if (!veryPin) return `END Incorrect PIN`;

        return `CON Enter Amount`;
    }

    public createPin = async (phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        if (checkUser.data?.pin) return `END PIN already created`;

        if (pin.length !== 4) return `END Invalid PIN format. Please enter a 4-digit PIN.`;

        const hashPin = this._encryptionRepo.encryptPassword(pin)

        const createPin = await this._userModel.updateAccount(phoneNumber, {pin: hashPin})
        if (!createPin.data) return `END Unable to save pin`;

        return `END PIN created successfully.`;
    }

    public createEvmAccount = async (phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const evmChainAccount = this.evmRepository.createWallet()
        if (!evmChainAccount.status) return `END Unable to create account`;
        
        const evmPublicKey = evmChainAccount.address
        const evmPrivateKey = evmChainAccount.private_key

        const addEvmAccount = await this._userModel.updateAccount(phoneNumber, {evmPrivateKey, evmPublicKey})
        if (!addEvmAccount.data) return `END Unable to create EVM account`;

        return `END EVM Account created successfully.`;
    }

    public gasprice = async (phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const gasPrice = this.evmRepository.gasPrice()
        

        return `END EVM gas price.`;
    }


    // public getBalance = async (phoneNumber: string, pin: string) => {
    //     const checkUser = await this._userModel.checkIfExist({phoneNumber})
    //     if (!checkUser.data) return `END Unable to get your account`;

    //     const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
    //     if (!veryPin) return `END Incorrect PIN`;

    //     //get the real bToken balance from blockchain
    //     const nativeTokenBalance = await this.tokenFactoryClient.getNativeTokenBal(checkUser.data.publicKey)

    //     const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

    //     const nairaConnectWallet = await this.tokenFactoryClient.connectWallet(mnemonic)

    //     const atomConnectWallet = await this.atomTokenFactoryClient.connectWallet(mnemonic)

    //     const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)

    //     const tokenInfoMsg = await this.beepTxClient.tokeInfo()

    //     const nairaTokenInfo =await this.tokenFactoryClient.query(nairaConnectWallet.client, tokenInfoMsg)
    //     if (!nairaTokenInfo.status) return `END Unable to get balance`;

    //     const atomTokenInfo =await this.atomTokenFactoryClient.query(atomConnectWallet.client, tokenInfoMsg)
    //     if (!atomTokenInfo.status) return `END Unable to get balance`;

    //     const nairaDecimal = nairaTokenInfo.result.decimals
    //     const atomDecimal = atomTokenInfo.result.decimals

    //     const nairaTokenBalance = await this.tokenFactoryClient.query(nairaConnectWallet.client, balanceMsg)
    //     if (!nairaTokenBalance.status) return `END Unable to get balance`;

    //     const atomTokenBalance = await this.atomTokenFactoryClient.query(atomConnectWallet.client, balanceMsg)
    //     if (!atomTokenBalance.status) return `END Unable to get balance`;

    //     const nairaMicroAmount = new BigNumber(nairaTokenBalance.result.balance)
    //     const atomMicroAmount = new BigNumber(atomTokenBalance.result.balance);

    //     const nairaTokenAmount = nairaMicroAmount.dividedBy(new BigNumber(10).pow(nairaDecimal)).toString();
    //     const atomTokenAmount = atomMicroAmount.dividedBy(new BigNumber(10).pow(atomDecimal)).toString();

    //     let mobileNumber = modifiedPhoneNumber(phoneNumber);

    //     const text = `NGN Balance: ${nairaTokenAmount}, ATOM Balance: ${atomTokenAmount}`

    //     sendSms(mobileNumber, text)

    //     return `END NGN Balance: ${nairaTokenAmount}
    //     ATOM Balance: ${atomTokenAmount}`;
    // }


}

export default AuthService;