export interface Referral {
    phoneNumber: string;
}

export interface IUserAccount {
    _id?: string;
    phoneNumber: string;
    pin: string;
    publicKey: string;
    privateKey: string;
    balance: number;
    evmPublicKey?: string;
    evmPrivateKey?: string;
    referrals: Array<Referral>;
    whatsappPin?: string;
    requestWhatsappPin: boolean;
    updatedAt?: Date;
    createdAt?: Date;
}