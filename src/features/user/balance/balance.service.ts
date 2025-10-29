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

class BalanceService {
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

    public enterPin = async () => {
        return `CON Enter PIN`;
    }

    public selectionChain = async (phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
        if (!veryPin) return `END Incorrect PIN`;

        return `CON Select Chain
        1. Cosmos
        2. Hedera`;
    }

    public getCosmosBalance = async (phoneNumber: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        //get the real bToken balance from blockchain
        const nativeTokenBalance = await this.tokenFactoryClient.getNativeTokenBal(checkUser.data.publicKey)

        const mnemonic =  this._encryptionRepo.decryptToken(checkUser.data.privateKey, process.env.ENCRYTION_KEY as string )

        const nairaConnectWallet = await this.tokenFactoryClient.connectWallet(mnemonic)

        const atomConnectWallet = await this.atomTokenFactoryClient.connectWallet(mnemonic)

        const balanceMsg = await this.beepTxClient.balance(checkUser.data.publicKey)

        const tokenInfoMsg = await this.beepTxClient.tokeInfo()

        const nairaTokenInfo =await this.tokenFactoryClient.query(nairaConnectWallet.client, tokenInfoMsg)
        if (!nairaTokenInfo.status) return `END Unable to get balance`;

        const atomTokenInfo =await this.atomTokenFactoryClient.query(atomConnectWallet.client, tokenInfoMsg)
        if (!atomTokenInfo.status) return `END Unable to get balance`;

        const nairaDecimal = nairaTokenInfo.result.decimals
        const atomDecimal = atomTokenInfo.result.decimals

        const nairaTokenBalance = await this.tokenFactoryClient.query(nairaConnectWallet.client, balanceMsg)
        if (!nairaTokenBalance.status) return `END Unable to get balance`;

        const atomTokenBalance = await this.atomTokenFactoryClient.query(atomConnectWallet.client, balanceMsg)
        if (!atomTokenBalance.status) return `END Unable to get balance`;

        const nairaMicroAmount = new BigNumber(nairaTokenBalance.result.balance)
        const atomMicroAmount = new BigNumber(atomTokenBalance.result.balance);

        const nairaTokenAmount = nairaMicroAmount.dividedBy(new BigNumber(10).pow(nairaDecimal)).toString();
        const atomTokenAmount = atomMicroAmount.dividedBy(new BigNumber(10).pow(atomDecimal)).toString();

        let mobileNumber = modifiedPhoneNumber(phoneNumber);

        const text = `NGN Balance: ${nairaTokenAmount}, ATOM Balance: ${atomTokenAmount}`

        sendSms(mobileNumber, text)

        return `END NGN Balance: ${nairaTokenAmount}
        ATOM Balance: ${atomTokenAmount}`;
    }

    public getHederaBalance = async (phoneNumber: string,) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const evmPublicKey = checkUser.data.evmPublicKey;
        console.log('evmPublicKey', evmPublicKey)

        //get the real bToken balance from blockchain
        const nativeTokenBalance = await this.evmRepository.nativeTokenBalance({address: evmPublicKey!});
        console.log('nativeTokenBalance', nativeTokenBalance)
        if (!nativeTokenBalance.status) return `END Unable to get balance`;

        const NGNTokenBalance = await this.evmRepository.balance({address: evmPublicKey!, contractAddress:  process.env.NGN_TOKEN_HEDERA_CONTRACT!})
        console.log('NGNTokenBalance', NGNTokenBalance)
        if (!NGNTokenBalance.status) return `END Unable to get balance`;


        const text = `NGN Balance on hedera: ${NGNTokenBalance.balance}, HEDERA Balance: ${nativeTokenBalance.largeUnit}`

        let mobileNumber = modifiedPhoneNumber(phoneNumber);

        sendSms(mobileNumber, text)

        return `END NGN Balance on hedera: ${NGNTokenBalance.balance}
        HEDERA Balance: ${nativeTokenBalance.largeUnit}`;
    }


}

export default BalanceService;