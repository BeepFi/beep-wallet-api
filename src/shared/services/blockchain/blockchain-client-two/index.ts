import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, AccountData } from "@cosmjs/proto-signing";
import { StargateClient } from "@cosmjs/stargate"
import { GasPrice } from "@cosmjs/stargate";

export class TokenFactoryClient {
    private rpcEndpoint: string;
    private contractAddress: string;

    constructor(rpcEndpoint: string, contractAddress: string) {
        this.rpcEndpoint = rpcEndpoint;
        this.contractAddress = contractAddress;
    }

    async changeContractAddress(contractAddress: string) {
        this.contractAddress = contractAddress;
    }

    async createAccount() {
        const prefix = "neutron";
        const wallet = await DirectSecp256k1HdWallet.generate(12, {prefix});
        const address = await wallet.getAccounts()

        return {
            publicKey: address[0].address,
            mnemonic: wallet.mnemonic
        }
    }

    async connectWallet(mnemonic: string ) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: "neutron",
        });

        const client = await SigningCosmWasmClient.connectWithSigner(
            this.rpcEndpoint,
            wallet,
            { gasPrice: GasPrice.fromString("0.025untrn") }
        );
    
        const [account] = await wallet.getAccounts();
        console.log("Sender Address:", account.address);
    
        return { client, sender: account };
    }

    async getNativeTokenBal(address: string) {
        try {
            // Connect to the blockchain
            const client = await StargateClient.connect(this.rpcEndpoint);

            // const RPC_ENDPOINT = "https://rpc-palvus.pion-1.ntrn.tech";
            // const client = await StargateClient.connect(RPC_ENDPOINT)
    
            // Query the balance of the address
            const balance = await client.getBalance(address, "untrn");
    
            console.log(`Balance: ${balance.amount} ${balance.denom}`);
            return {
                status: true,
                balance: balance.amount,
                denom: balance.denom
            }
        } catch (error) {
            return {status: false, message: "Unable to perform transaction"}
        }
    }

    async sendNativeToken(client: SigningCosmWasmClient, sender: AccountData, receivepient: string, msg: any) {
        try {
            const result = await client.sendTokens(
                sender.address, 
                receivepient,
                msg,
                "auto",
                "Native token transfer"
            )
            return {status: true, message: "transaction in process", result}
        } catch (error) {
            console.log('error', error)
            return {status: false, message: "Unable to perform transaction"}
        }
    }

    async query(client: SigningCosmWasmClient, queryMsg: any) {
        try {
            const result = await client.queryContractSmart(this.contractAddress, queryMsg);
            return {status: true, message: "transaction in process", result}
        } catch (error) {
            console.log('error', error)
            return {status: false, message: "Unable to perform transaction"}
        }
    }

    async tx(client: SigningCosmWasmClient, sender: AccountData, transferMsg: any) {
        try {
            const result = await client.execute(sender.address, this.contractAddress, transferMsg, "auto");
            return {status: true, message: "transaction in process", result}
        } catch (error) {
            console.log('error', error)
            return {status: false, message: "Unable to perform transaction"}
        }
    }

    async estimateContractExecutionGas  (
        mnemonic: string,
        // contractAddress: string,
        msg: Record<string, any>,
    ){
        try {

            const prefix = "neutron";

            const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: prefix,
            });
            const [account] = await wallet.getAccounts();
        
            const gasPrice = GasPrice.fromString("0.025untrn"); // Adjust if Neutron uses a different rate
        
            const client = await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, wallet, {
            //   prefix: prefix,
            gasPrice,
            });
        
            const gasUsed = await client.simulate(account.address, [
            {
                typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                value: {
                sender: account.address,
                contract: this.changeContractAddress,
                msg: new TextEncoder().encode(JSON.stringify(msg)),
                funds: [],
                },
            },
            
            ], "");
        
            const feeAmount = Math.ceil(gasUsed * gasPrice.amount.toFloatApproximation());
        
            return {
                gasUsed,
                fee: {
                    amount: [{ denom: "untrn", amount: feeAmount.toString() }],
                    gas: gasUsed.toString(),
                },
            };
        } catch (error) {
            console.log('error', error)
            return {status: false, message: "Unable to perform transaction"}
        }
    };
}

