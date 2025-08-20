const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
import { isSessionExpired } from "./shared/constant/checkTimeDifferent";
import UserAccountModel from "./shared/services/database/user/Account/index";
import TransactionModel from "./shared/services/database/user/transaction/index";
import WithdrawalRequestModel from "./shared/services/database/user/withdrawalRequest/index";
import EncryptionRepo from "./shared/services/encryption/index";
import AuthService from "./features/user/whatsapp/auth/auth.service";
import DepositService from "./features/user/whatsapp/deposit/deposite.service";
import ConvertService from "./features/user/whatsapp/convert/convert.service";
import TransferService from "./features/user/whatsapp/transfer/transfer.service";
import WithdrawalService from "./features/user/whatsapp/withdraw/withrawal.service";
import ReferralService from "./features/user/whatsapp/referral/referral.service";


const encryptionRepo = new EncryptionRepo()

const userModel = new UserAccountModel()
const transactionModel = new TransactionModel()
const withdrawalRequestModel = new WithdrawalRequestModel()

const authService = new AuthService({userModel, encryptionRepo})
const depositService = new DepositService({userModel, transactionModel, encryptionRepo})
const convertService = new ConvertService({userModel, transactionModel, encryptionRepo})
const transferService = new TransferService({userModel, transactionModel, encryptionRepo})
const withdrawalService = new WithdrawalService({userModel, transactionModel, withdrawalRequestModel, encryptionRepo})
const referralService = new ReferralService({userModel, encryptionRepo})


let sessions = {}; // Store user sessions here
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes


export const whatSappRoute  = () => {
    const client = new Client();

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });

    // client.on('message_create', message => {
    // 	console.log(message.body);
    // });

    client.on('message', (message: any) => {
        console.log(`📩 Message from ${message.from}: ${message.body}`);

        const phone = `+${message.from.split('@')[0]}`;
        console.log(`📱 Phone number: ${phone}`);

        if (message.body.toLowerCase() === 'start') {
            sessions[phone] = {
                messages: "start",
                startedAt: Date.now()
            };
            authService.start(message, phone)

        }else{
            if (sessions[phone]) {

                if (isSessionExpired(sessions[phone].startedAt)) return message.reply('session expired. Please enter start'); 
                
                sessions[phone] = {
                    messages: `${sessions[phone].messages}*${message.body.toLowerCase()}`,
                    startedAt: sessions[phone].startedAt
                };

                let text = sessions[phone].messages;

                console.log("text", text)

                if (text.startsWith('start*1')) {
                    let parts = text.split('*');
                    if (parts.length == 2) {     
                       depositService.start(message, phone)
                    } else if (parts.length === 3) {
                        let pin = text.split('*')[2];
                        depositService.verifyUser(message, phone, pin)
                    }else if (parts.length === 4) {
                        let amount = text.split('*')[3];
                        depositService.initializeDeposit(message, phone, amount)
                    }else if (parts.length === 5) {
                        let reference = text.split('*')[4];
                        depositService.verifyDeposit(message, phone, reference)
                    }
                }else if(text.startsWith('start*2')){
                    let parts = text.split('*');
                    if (parts.length == 2) {     
                       transferService.start(message, phone)
                    }else if (parts.length === 3) {
                        let pin = text.split('*')[2];
                        transferService.verifyUser(message, phone, pin)
                    }else if (parts.length === 4) {
                        transferService.enterAddress(message)
                    }else if (parts.length === 5) {
                        let amount = text.split('*')[3];
                        let address = text.split('*')[4];
                        transferService.transfer(message, phone, amount, address)
                    }
                }else if(text.startsWith('start*3')){
                    let parts = text.split('*');
                    if (parts.length == 2) {     
                       withdrawalService.start(message, phone)
                    }else if (parts.length === 3) {
                        let pin = text.split('*')[2];
                        withdrawalService.verifyUser(message, phone, pin)
                    }else if (parts.length === 4) {
                        withdrawalService.enterAccountNumber(message)
                    }else if (parts.length === 5) {
                        withdrawalService.enterBankName(message)
                    }else if (parts.length === 6) {
                        let amount = text.split('*')[3];
                        let account = text.split('*')[4];
                        let bank = text.split('*')[5];
                        withdrawalService.withdraw(message, phone,  amount, account, bank)
                    }
                }
                else if(text.startsWith('start*4')){
                    let parts = text.split('*');
                    if (parts.length == 2) {     
                       convertService.start(message, phone)
                    }else if (parts.length === 3) {
                        let pin = text.split('*')[2];
                        convertService.verifyUser(message, phone, pin)
                    }else if (parts.length === 4) {
                        convertService.enterAmountIn(message)
                    }else if (parts.length === 5) {
                        convertService.enterAmountOut(message)
                    }else if (parts.length === 6) {
                        let amountIn = text.split('*')[4];
                        let amountOut = text.split('*')[5];
                        convertService.convertBNGNToBToken(message, phone, amountIn, amountOut)
                    }
                }
                else if(text.startsWith('start*5')){
                    let parts = text.split('*');
                    if (parts.length == 2) {     
                       convertService.start(message, phone)
                    }else if (parts.length === 3) {
                        let pin = text.split('*')[2];
                        convertService.verifyUser(message, phone, pin)
                    }else if (parts.length === 4) {
                        convertService.enterAmountIn(message)
                    }else if (parts.length === 5) {
                        convertService.enterAmountOut(message)
                    }else if (parts.length === 6) {
                        let amountIn = text.split('*')[4];
                        let amountOut = text.split('*')[5];
                        convertService.convertBTokenToBNGN(message, phone, amountIn, amountOut)
                    }
                }
                else if(text.startsWith('start*6')){
                    let parts = text.split('*');
                    if (parts.length == 2) {     
                       authService.enterPin(message, phone)
                    } else if (parts.length === 3) {
                        let pin = text.split('*')[2];
                       authService.getBalance(message, phone, pin)
                    }
                }
                else if(text.startsWith('start*7')){
                    console.log("session", sessions)
                    console.log(3)
                }else{
                    console.log("error", "invalid number")
                }

                
            }else{
                sessions[phone] = {
                    messages: "start",
                    startedAt: Date.now()
                };

                authService.start(message, phone)
            }
        }
    
        if (message.body.toLowerCase() === 'hello') {
        message.reply('Hi there! 👋'); 
        }
    
        if (message.body.toLowerCase() === 'help') {
        message.reply('Available commands:\n1. hello\n2. help');
        }
    });

    client.initialize();

}