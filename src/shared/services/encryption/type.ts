

interface EncryptionInterface {

    encryptToken: (data: any, secret: any) => string;

    decryptToken: (data: any, secret: any) => any;

    encryptPassword: (password: string) => string;

    comparePassword: (password: string, userPassword :string) => boolean;
}

export default EncryptionInterface;