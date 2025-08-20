import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import EncryptionInterface from "./type";


class EncryptionRepo implements EncryptionInterface {
    jwt: typeof jwt;
    uuid: any;
    bcrypt: typeof bcrypt;

    constructor() {
        this.jwt = jwt;
        this.uuid = uuid;
        this.bcrypt = bcrypt;
    }

    public encryptToken = (data: any, secret: any) => {
        // return jwt.sign(data, process.env.SECRET_ENCRYPTION_KEY!);
        return jwt.sign(data, secret);
    }

    public decryptToken = (data: any, secret: any): string => { 
        // return jwt.verify(data, process.env.SECRET_ENCRYPTION_KEY!) as string;
        return jwt.verify(data, secret) as string;
    }

    public encryptPassword = (password:any) => {
        return this.bcrypt.hashSync(password, 10);
    }

    public comparePassword = ( password: string, userPassword :string ) => {
        return this.bcrypt.compareSync(password, userPassword)
    }
}

export default EncryptionRepo;