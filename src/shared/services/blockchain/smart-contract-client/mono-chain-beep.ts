import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";

export interface Coin {
    readonly denom: string;
    readonly amount: string;
}

// Existing types remain the same
export interface Config {
  admin: string;
  supported_tokens: string[];
  default_timeout_height: number;
  supported_protocols: string[];
}

export interface BeepCoin {
  token: string;
  amount: string;
  is_native: boolean;
}

export interface ExpectedToken {
  token: string;
  is_native: boolean;
  amount: string;
  target_address?: string;
}

export type IntentStatus = "Active" | "Completed" | "Expired";

export interface IntentType {
  Swap: {
    output_tokens: ExpectedToken[];
  };
}

export interface Intent {
  id: string;
  creator: string;
  input_tokens: BeepCoin[];
  intent_type: IntentType;
  executor?: string;
  status: IntentStatus;
  created_at: number;
  timeout: number;
  tip: BeepCoin;
}

// Query response types
export interface ConfigResponse {
  admin: string;
  supported_tokens: string[];
  default_timeout_height: number;
}

export interface IntentResponse {
  intent: Intent;
}

export interface IntentsResponse {
  intents: Intent[];
}

export interface UserNonceResponse {
  nonce: string; // u128 comes as string in JSON
}

export class BeepContractClient {
  private signingClient: SigningCosmWasmClient | null = null;
  private queryClient: CosmWasmClient | null = null;
  private readonly contractAddress: string;
  private readonly rpcEndpoint: string;
  private wallet: DirectSecp256k1HdWallet | null = null;

  constructor(
    contractAddress: string,
    rpcEndpoint: string
  ) {
    this.contractAddress = contractAddress;
    this.rpcEndpoint = rpcEndpoint;
  }

  async connect(mnemonic = "empower spin strong sheriff grace dash sport film staff balcony corn august") {
    // Set up signing client for execute messages
    // const mnem = "empower spin strong sheriff grace dash sport film staff balcony corn august";

    this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "neutron"
    });

    this.signingClient = await SigningCosmWasmClient.connectWithSigner(
      this.rpcEndpoint,
      this.wallet,
      { gasPrice: GasPrice.fromString("0.025untrn") }
    );

    // Set up query client
    this.queryClient = await CosmWasmClient.connect(this.rpcEndpoint);

    return this.signingClient;
  }

  // Query methods - don't require signing
  async getConfig(): Promise<ConfigResponse> {
    if (!this.queryClient) {
      throw new Error("Query client not initialized. Call connect() first.");
    }

    return await this.queryClient.queryContractSmart(
      this.contractAddress,
      { get_config: {} }
    );
  }

  async getIntent(id: string): Promise<IntentResponse> {
    if (!this.queryClient) {
      throw new Error("Query client not initialized. Call connect() first.");
    }

    return await this.queryClient.queryContractSmart(
      this.contractAddress,
      { get_intent: { id } }
    );
  }

  async listIntents(
    startAfter?: string,
    limit?: number
  ): Promise<IntentsResponse> {
    if (!this.queryClient) {
      throw new Error("Query client not initialized. Call connect() first.");
    }

    return await this.queryClient.queryContractSmart(
      this.contractAddress,
      {
        list_intents: {
          start_after: startAfter,
          limit: limit
        }
      }
    );
  }

  async getUserNonce(address: string): Promise<UserNonceResponse> {
    if (!this.queryClient) {
      throw new Error("Query client not initialized. Call connect() first.");
    }

    return await this.queryClient.queryContractSmart(
      this.contractAddress,
      { get_user_nonce: { address } }
    );
  }

  // Existing execute methods remain the same but use signingClient instead of client
  private async ensureSigningConnection() {
    if (!this.signingClient) {
      throw new Error("Signing client not connected. Call connect() first.");
    }
    return this.signingClient;
  }

  async getAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not initialized. Call connect() first.");
    }
    const [firstAccount] = await this.wallet.getAccounts();
    return firstAccount.address;
  }

  // Increase allowance for CW20 tokens
  async increaseAllowance(
    cw20TokenContract: string,
    spender: string,
    amount: string,
    funds?: Coin[]
  ) {
    try {
      const client = await this.ensureSigningConnection();
      const senderAddress = await this.getAddress();

      const msg = {
          increase_allowance: {
              spender: spender,
              amount: amount
          }
      };

      const result = await client.execute(
          senderAddress,
          cw20TokenContract,
          msg,
          "auto",
          undefined,
          funds
      );

      return {
        status: true,
        result
      }
      
    } catch (error) {
      console.log('error', error)
      return {
        status: false,
        error
      }
    }
  
  }

  // Example of an updated execute method
  async createIntent(
    inputTokens: BeepCoin[],
    outputTokens: ExpectedToken[],
    tip: BeepCoin,
    timeout?: number,
    funds?: Coin[]
  ) {
    try {

      const client = await this.ensureSigningConnection();
      const senderAddress = await this.getAddress();
      
      const msg = {
        create_intent: {
          intent_type: {
            Swap: {
              output_tokens: outputTokens
            }
          },
          input_tokens: inputTokens,
          timeout,
          tip
        }
      };

      const result = await client.execute(
        senderAddress,
        this.contractAddress,
        msg,
        "auto",
        undefined,
        funds
      );

      return {
        status: true,
        result
      }
      
    } catch (error) {
      console.log('error', error)
      return {
        status: false,
        error
      }
      
    }
  }

  async fillIntent(
    intentId: string,
    outputTokens: ExpectedToken[],
    funds?: Coin[]
  ) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      fill_intent: {
        intent_id: intentId,
        intent_type: {
          Swap: {
            output_tokens: outputTokens
          }
        }
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto",
      undefined,
      funds
    );
  }

  async withdrawIntentFund(intentId: string) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      withdraw_intent_fund: {
        intent_id: intentId
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }

  async updateAdmin(newAdmin: string) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      update_admin: {
        new_admin: newAdmin
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }

  async addSupportedTokens(tokens: string[]) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      add_supported_tokens: {
        tokens
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }

  async removeSupportedTokens(tokens: string[]) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      remove_supported_tokens: {
        tokens
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }

  async addSupportedProtocols(protocols: string[]) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      add_supported_protocols: {
        protocols
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }

  async removeSupportedProtocols(protocols: string[]) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      remove_supported_protocols: {
        protocols
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }

  async updateDefaultTimeoutHeight(defaultTimeoutHeight: number) {
    const client = await this.ensureSigningConnection();
    const senderAddress = await this.getAddress();
    
    const msg = {
      update_default_timeout_height: {
        default_timeout_height: defaultTimeoutHeight
      }
    };

    return await client.execute(
      senderAddress,
      this.contractAddress,
      msg,
      "auto"
    );
  }
}

import dotenv from "dotenv"

dotenv.config()


export const example = async () => {
  // Upload successful, code ID: 10906
  // Contract instantiated at: neutron13r9m3cn8zu6rnmkepajnm04zrry4g24exy9tunslseet0s9wrkkstcmkhr
  try {
    const CONTRACT_ADDRESS = "neutron13r9m3cn8zu6rnmkepajnm04zrry4g24exy9tunslseet0s9wrkkstcmkhr";
    const RPC_ENDPOINT = "https://rpc-palvus.pion-1.ntrn.tech";
    const MNEMONIC = process.env.MNEMONIC!;
    const tATOM = "neutron1sr60e2velepytzsdyuutcmccl9n2p2lu3pjcggllxyc9rzyu562sqegazj";
    const tNGN = "neutron1he6zd5kk03cs5ywxk5tth9qfewxwnh7k9hjwekr7gs9gl9argadsqdc9rp"

    const client = new BeepContractClient(
      CONTRACT_ADDRESS,
      RPC_ENDPOINT
    );

    await client.connect(MNEMONIC);

    // increase tATOM allowance 
    let atomAllowanceRes = await client.increaseAllowance(tATOM, CONTRACT_ADDRESS, "10");
    console.log("Increase Allowance Transaction Result:", atomAllowanceRes);

    // increase allowance for tip
    let tipAllowanceRes = await client.increaseAllowance(tNGN, CONTRACT_ADDRESS, "1");
    console.log("Increase Allowance Transaction Result:", tipAllowanceRes);

    // Execute example
    const result = await client.createIntent(
      [{ 
        token: tATOM,
        amount: "10",
        is_native: false
      }],
      [{
        token: tNGN,
        amount: "1",
        is_native: false,
        target_address: undefined
      }],
      { 
        token: tNGN,
        amount: "1",
        is_native: false
      },
      undefined,
      []
    );
    console.log("Create Intent Transaction Result:", result);

    // // increase allowance 
    // let ngnAllowanceRes = await client.increaseAllowance(tNGN, CONTRACT_ADDRESS, "50");
    // console.log("Increase Allowance Transaction Result:", ngnAllowanceRes);

    // let res = await client.fillIntent(
    //     "intent52ff63e02bee532efa520d74b113b032a847eee4", // Change to your own intent id
    //     [{
    //         token: "neutron1he6zd5kk03cs5ywxk5tth9qfewxwnh7k9hjwekr7gs9gl9argadsqdc9rp",
    //         amount: "50",
    //         is_native: false,
    //         target_address: undefined
    //     }]
    // )
    // console.log("Fill Intent Transaction Result:", res);

    // // Query examples
    // const config = await client.getConfig();
    // console.log("Contract config:", config);

    // const intents = await client.listIntents(undefined, 10);
    // console.log("First 10 intents:", JSON.stringify(intents));

    // const userNonce = await client.getUserNonce("neutron107nhk9pqhp446fr0fc83z0v82rg9guy8runkuz");
    // console.log("User nonce:", userNonce);

    return "correct"
  } catch (error) {
    console.error("Error:", error);
  }
};

// example().catch(console.error);