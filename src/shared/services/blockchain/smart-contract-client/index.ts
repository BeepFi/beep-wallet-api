import dotenv from "dotenv"
import { BeepContractClient } from "./mono-chain-beep";

dotenv.config()

 const example = async () => {
  // Upload successful, code ID: 10906
  // Contract instantiated at: neutron13r9m3cn8zu6rnmkepajnm04zrry4g24exy9tunslseet0s9wrkkstcmkhr
  try {
    const CONTRACT_ADDRESS = "neutron13r9m3cn8zu6rnmkepajnm04zrry4g24exy9tunslseet0s9wrkkstcmkhr";
    const RPC_ENDPOINT = "https://rpc-palvus.pion-1.ntrn.tech";
    const MNEMONIC = process.env.ADMIN_MNEMONIC!;
    const tATOM = "neutron1sr60e2velepytzsdyuutcmccl9n2p2lu3pjcggllxyc9rzyu562sqegazj";
    const tNGN = "neutron1he6zd5kk03cs5ywxk5tth9qfewxwnh7k9hjwekr7gs9gl9argadsqdc9rp"

    const client = new BeepContractClient(
      CONTRACT_ADDRESS,
      RPC_ENDPOINT
    );

    await client.connect(MNEMONIC);

    // // increase tATOM allowance 
    // let atomAllowanceRes = await client.increaseAllowance(tATOM, CONTRACT_ADDRESS, "10");
    // console.log("Increase Allowance Transaction Result:", atomAllowanceRes);

    // Execute example
    const result = await client.createIntent(
      [{ 
        token: "neutron1he6zd5kk03cs5ywxk5tth9qfewxwnh7k9hjwekr7gs9gl9argadsqdc9rp",
        amount: "10",
        is_native: false
      }],
      [{
        token: "neutron1sr60e2velepytzsdyuutcmccl9n2p2lu3pjcggllxyc9rzyu562sqegazj",
        amount: "50",
        is_native: false,
        target_address: undefined
      }],
      { 
        token: "neutron1he6zd5kk03cs5ywxk5tth9qfewxwnh7k9hjwekr7gs9gl9argadsqdc9rp",
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

export * from './mono-chain-beep'