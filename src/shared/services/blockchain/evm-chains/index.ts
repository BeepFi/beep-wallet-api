import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ethers, Wallet} from 'ethers'
import { beepAbi } from "./beep.abi";
import { beepErc20Abi } from "./test.ab";

// const rpc = "http://127.0.0.1:8545"
const rpc = "https://testnet.hashio.io/api"


class EvmRepository {
    ethProvider: ethers.providers.JsonRpcProvider;

    constructor () {
       
        this.ethProvider = new ethers.providers.JsonRpcProvider(rpc);
    } 
    // https://bsc-mainnet.core.chainstack.com/f983be2707bbd29cc9aedf112062eea0

    public encryptToken = (data: any) => {
        return jwt.sign(data, process.env.EVM_ENCRYPTION_KEY!);
    }

    public decryptToken = (data: any): string => {
        return jwt.verify(data, process.env.EVM_ENCRYPTION_KEY!) as string;
    }

    gasPrice = async() => {
        try {
            const gasPrice = await this.ethProvider.getGasPrice()

            return{
                status: true,
                wei: gasPrice.toString(),
                gwei: ethers.utils.formatUnits(gasPrice, "gwei"),
                eth: ethers.utils.formatEther(gasPrice)
            } 
            
        } catch (error) {
            return {
                status: false,
                error
            }
        }
        
    }

    getGasPrices = async () => {
        try {
        //   const response = await axios.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY ?? ""}`);
          const response = await axios.get("https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=PYFNHX6FTQIGKTFTS76M38I4MAQGHTHZBP");
        //   https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=YOUR_POLYGONSCAN_API_KEY

          if (response.data.status === "1") {
              return {
                  success: true,
                  gasPrices: {
                      low: response.data.result.SafeGasPrice,
                      average: response.data.result.ProposeGasPrice,
                      high: response.data.result.FastGasPrice
                  }
              };
          } else {
              return { success: false, message: response.data.result };
          }

        // return { success: true, message: response.data.result };
        } catch (error) {
          console.error('Error fetching gas prices:', error);
          return { success: false, message: 'Error fetching gas prices' };
        }
  
    }

    createWallet =  () => {
        try {
            const account = Wallet.createRandom()

            return {
                status: true,
                address: account.address,
                private_key: this.encryptToken(account.privateKey),
            }
        } catch (err) {
            return {
                status: false,
                err
            }
        }
    }

    mint = async({address, private_key, amount, contractAddress}: {
        address: string
        private_key: string
        amount: number,
        contractAddress: string
    }) => {
        try {
            // const WALLET_SECRET = this.decryptToken(private_key);
            const WALLET_SECRET = private_key;
            const web3Provider = this.ethProvider;
            const wallet = new ethers.Wallet(WALLET_SECRET);
            const connectedWallet = wallet.connect(web3Provider);

            const contract = new ethers.Contract( contractAddress, beepErc20Abi, web3Provider);

            const gasPrice = await this.gasPrice()

            const amountStr = Number(amount).toFixed(18);
            const mintAmount = ethers.utils.parseUnits(amountStr, 18);

            const transfer = await contract.connect(connectedWallet).mint(
                address,
                mintAmount,
                {
                    gasPrice: ethers.utils.parseUnits( gasPrice.gwei!.toString(), 'gwei'), // Adjust the gas price
                }
            );

            const transferRes = await transfer.wait()

            return {
                status: true,
                amount: amount,
                address: address,
                data: transferRes
            }

        } catch (error) {
            console.log("error", error)
            return {
                status: false,
                error
            };
        }
    }

    burn = async({address, private_key, amount, contractAddress}: {
        address: string
        private_key: string
        amount: number,
        contractAddress: string
    }) => {
        try {
            const WALLET_SECRET = this.decryptToken(private_key);
            // const WALLET_SECRET = private_key;
            const web3Provider = this.ethProvider;
            const wallet = new ethers.Wallet(WALLET_SECRET);
            const connectedWallet = wallet.connect(web3Provider);

            const contract = new ethers.Contract( contractAddress, beepErc20Abi, web3Provider);

            const gasPrice = await this.gasPrice()

            const burnAmount = ethers.utils.parseUnits(amount.toString(), 18).toString();

            const transfer = await contract.connect(connectedWallet).burn(
                burnAmount,
                {
                    gasPrice: ethers.utils.parseUnits( gasPrice.gwei!.toString(), 'gwei'), // Adjust the gas price
                    // gasPrice: ethers.utils.parseUnits( "50", 'gwei'), 
                    // gasLimit,
                }
            );

            const transferRes = await transfer.wait()

            return {
                status: true,
                amount: amount,
                address: address,
                data: transferRes
            }

        } catch (error) {
            return {
                status: false,
                error
            };
        }
    }

    transferToken = async({address, private_key, amount, contractAddress}: {
        address: string
        private_key: string
        amount: number
        contractAddress: string
    }) => {
        try {
            const WALLET_SECRET = this.decryptToken(private_key);
            const web3Provider = this.ethProvider;
            const wallet = new ethers.Wallet(WALLET_SECRET);
            const connectedWallet = wallet.connect(web3Provider);

            const contract = new ethers.Contract( contractAddress, beepErc20Abi, web3Provider);

            const gasPrice = await this.gasPrice()
            const transferAmount = ethers.utils.parseUnits(amount.toString(), 18).toString();

            const transfer = await contract.connect(connectedWallet).transfer(
                address,
                transferAmount,
                {
                    gasPrice: ethers.utils.parseUnits( gasPrice.gwei!.toString(), 'gwei'), // Adjust the gas price
                }
            );

            const transferRes = await transfer.wait()

            return {
                status: true,
                amount: amount,
                address: address,
                data: transferRes
            }

        } catch (error) {
            return {
                status: false,
                error
            };
        }

    }
    

    balance = async({address, contractAddress}: {
        address: string;
        contractAddress: string;
    
    }) => {
        try {
            const web3Provider = this.ethProvider;
    
            // const contract = new ethers.Contract( process.env.CONTRACT_ADDRESS!, abi, web3Provider);
            const contract = new ethers.Contract( contractAddress, beepErc20Abi, web3Provider);

            const balance = await contract.balanceOf(address)
               
            const ethBalance = ethers.utils.formatEther(balance);

            return {
                status: true,
                balance: ethBalance,
                address: address,
            }

        } catch (error) {
            return {
                status: false,
                error
            };
        }

    }

    nativeTokenBalance = async({address,}: {
        address: string
    }) => {
        try {
            console.log(1)
            const web3Provider = this.ethProvider;

            console.log("Provider", web3Provider)

            console.log(2)

            // const balance = await web3Provider.getBalance("0xC4FBB9C353B6D8905DD02ABB3077Ec394aadA1A2");
            const balance = await web3Provider.getBalance(address);

            console.log(3)
            const ethbalance = ethers.utils.formatEther(balance)

            console.log(4)
            
            return {
                status: true,
                smallUnit: balance,
                largeUnit: ethbalance
            }

        } catch (error) {
            console.log("error", error)
            return {
                status: false,
                error
            };
        }

    }

    transferNativeToken = async ({
        senderPrivateKey,
        recipientAddress,
        amount
    }: {
        senderPrivateKey: string;
        recipientAddress: string;
        amount: number;
    }) => {
        try {
            // Decrypt private key (if you stored it encrypted)
            const WALLET_SECRET = this.decryptToken(senderPrivateKey);
            
            // Connect wallet to provider
            const web3Provider = this.ethProvider;
            const wallet = new ethers.Wallet(WALLET_SECRET, web3Provider);
            
            // Convert amount (ETH, BNB, etc.) to Wei
            const amountInWei = ethers.utils.parseEther(amount.toString());

            // Fetch current gas price
            const gasPrice = await this.gasPrice();

            // Create the transaction
            const tx = {
                to: recipientAddress,
                value: amountInWei,
                gasPrice: ethers.utils.parseUnits(gasPrice.gwei!.toString(), 'gwei'),
            };

            // Send transaction
            const transactionResponse = await wallet.sendTransaction(tx);
            const receipt = await transactionResponse.wait();

            return {
                status: true,
                message: "Native token transfer successful",
                hash: receipt.transactionHash,
                from: wallet.address,
                to: recipientAddress,
                amount: amount,
                data: receipt,
            };

        } catch (error) {
            console.error("Native token transfer error:", error);
            return {
                status: false,
                message: "Native token transfer failed",
                error,
            };
        }
    };


    createIntent = async({address, private_key, contractAddress, tokenIn, tokenOut, amountIn, amountOut, isNative}: {
        address: string
        private_key: string
        contractAddress: string
        tokenIn: string
        tokenOut: string
        amountIn: string
        amountOut: string
        isNative: boolean
    }) => {
        try {
            const WALLET_SECRET = this.decryptToken(private_key);
            const web3Provider = this.ethProvider;
            const wallet = new ethers.Wallet(WALLET_SECRET);
            const connectedWallet = wallet.connect(web3Provider);

            const contract = new ethers.Contract( contractAddress, beepAbi, web3Provider);

            const gasPrice = await this.gasPrice();

            const inputTokens = [
                {
                  token: tokenIn, // Native token
                  isNative: isNative,
                  amount: ethers.utils.parseUnits(amountIn, 18),
                },
            ];
          
            const outputTokens = [
                {
                    token: tokenOut, // Some ERC20 token
                    amount: ethers.utils.parseUnits(amountOut, 18),
                },
            ];
          
            const tip = {
                token: process.env.NGN_TOKEN_HEDERA_CONTRACT!, // native tip
                isNative: false,
                amount: ethers.utils.parseUnits("0.001", 18),
            };
          
            const timeout = 100; // example timeout
            const useWalletBalance = false;
            const priority = 1; // assuming enum 0=LOW,1=MEDIUM,2=HIGH
            const allowPaymasterFallback = false;
          
              // Calculate total native value required for msg.value
            let totalNative = ethers.BigNumber.from(0);
            if (!useWalletBalance) {
                for (const token of inputTokens) {
                  if (token.isNative) totalNative = totalNative.add(token.amount);
                }
                if (tip.isNative) totalNative = totalNative.add(tip.amount);
            }

            const createIntent = await contract.connect(connectedWallet).createIntent(
                inputTokens,
                outputTokens,
                timeout,
                tip,
                useWalletBalance,
                priority,
                allowPaymasterFallback,
                {
                    value: totalNative,
                    gasPrice: ethers.utils.parseUnits( gasPrice.gwei!.toString(), 'gwei'),  // Adjust the gas price
                }
            );

            const createIntentrRes = await createIntent.wait()

            return {
                status: true,
                address: address,
                data: createIntentrRes
            }

        } catch (error) {
            return {
                status: false,
                error
            };
        }

    }
}

export default EvmRepository