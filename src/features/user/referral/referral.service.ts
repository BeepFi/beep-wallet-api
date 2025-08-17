import IUserAccountModel from "../../../shared/services/database/user/Account/type";
import {UserAccount} from "../../../shared/services/database/user/Account/index";
import EncryptionInterface from "../../../shared/services/encryption/type";
import { sendSms } from "../../../shared/services/sms/termii";
import { modifiedPhoneNumber } from "../../../shared/constant/mobileNumberFormatter";
import dotenv from "dotenv";
// import BlockchainAccount from "../../../shared/services/blockchain/account";
import { TokenFactoryClient } from "../../../shared/services/blockchain/blockchain-client-two/index";
import { BeepTxClient } from "../../../shared/services/blockchain/blockchain-client-two/tx";
import { BigNumber } from "bignumber.js";
import { Referral } from "../../../shared/types/interfaces/responses/user/userAccount.response";

dotenv.config();

class ReferralService {
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

    public start = async () => {
        return `CON Enter PIN `;
    }

    public verifyUser = async (phoneNumber: string, pin: string) => {
        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        const veryPin = this._encryptionRepo.comparePassword(pin, checkUser.data.pin)
        if (!veryPin) return `END Incorrect PIN`;

        return `CON Enter number`;
    }


    public referUser = async (phoneNumber: string, referNumber: string) => {
        let number =`+${modifiedPhoneNumber(referNumber)}`;

        const checkUser = await this._userModel.checkIfExist({phoneNumber})
        if (!checkUser.data) return `END Unable to get your account`;

        // check referral limit
        if (checkUser.data?.referrals?.length > 100) return `END Referral limit reaches`;

        const checkNumber = await this._userModel.checkIfExist({phoneNumber: number})
        if (checkNumber.data) return `END Number already exist`;

        const blockChainAccount = await this.tokenFactoryClient.createAccount()
        const publicKey = blockChainAccount.publicKey
        const privateKey = this._encryptionRepo.encryptToken(blockChainAccount.mnemonic, process.env.ENCRYTION_KEY as string )
        
        const createAccount = await this._userModel.createAccountToDB({phoneNumber: number, publicKey, privateKey})
        if (!createAccount.data)  return `END Unable to refer user`;

        const referral: Referral = {phoneNumber: number};

        const addReferral = await UserAccount.findByIdAndUpdate(
            checkUser.data.id,
            { $push: { referrals: referral } },
            { new: true }
        );

        const adminMnemonic =  process.env.ADMIN_MNEMONIC as string 

        const adminConnectWallet = await this.tokenFactoryClient.connectWallet(adminMnemonic)

        const mintMsg = await this.beepTxClient.mint(checkUser.data.publicKey, (10 * 1000000).toString())

        const mintToken = await this.tokenFactoryClient.tx(adminConnectWallet.client, adminConnectWallet.sender,  mintMsg)
        if (!mintToken.status) return `END Unable to carry out Transaction`;

        return `END Number referred successfully.`;
    }

   


}

export default ReferralService;