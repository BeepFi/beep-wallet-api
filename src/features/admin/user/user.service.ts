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

class AdminUserService {
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

        const totalUser = await UserAccount.countDocuments()

        return `END ${totalUser} total users.`;
    }





}

export default AdminUserService;