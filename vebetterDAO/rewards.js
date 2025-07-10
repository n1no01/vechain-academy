import {
  ProviderInternalHDWallet,
  ThorClient,
  VeChainProvider
} from "@vechain/sdk-network";
import { X2EarnRewardsPool } from "@vechain/vebetterdao-contracts";

import dotenv from 'dotenv';
dotenv.config();

// export async function rewardUser() {
    // To transfer B3TR we first need to connect to the blockchain with
    // a wallet capable of signing and broadcastisting transactions
    const thor = ThorClient.at('https://testnet.vechain.org');
    const provider = new VeChainProvider(
      thor,
      new ProviderInternalHDWallet(process.env.MNEMONIC?.split(" "))
    );
    
    const signer = await provider.getSigner();

    // Call the VeBetterDAO smart contract
    const x2EarnRewardsPoolContract = thor.contracts.load(
      X2EarnRewardsPool.address.testnet,
      X2EarnRewardsPool.abi,
      signer
    );
    
    const tx =
      await x2EarnRewardsPoolContract.transact.distributeRewardWithProof(
        process.env.VEBETTERDAO_APP_ID,
        10,
        "0x78B19840aCAcFac7e1f235e07FD430A6763f28eE",
        ["link", "image"],
        ["https://link-to-proof.com", "https://link-to-image.com/1.png"],
        ["waste_mass"],
        [100],
        "User performed a sustainable action on my app",
      );
      await tx.wait();
      console.log(tx)

// }

