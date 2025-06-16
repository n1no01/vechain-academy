import { ThorClient } from "@vechain/sdk-network";
const thor = ThorClient.at("https://mainnet.vechain.org");
const thorTestnet = ThorClient.at("https://testnet.vechain.org");

// get the current latest & best block from the chain
const bestBlock = await thor.blocks.getBestBlockCompressed();
console.log("Best Block:", bestBlock?.number, bestBlock?.id);

// get the first and genesis block from the chain
const genesisBlock = await thor.blocks.getBlockCompressed(0);
console.log("Genesis Block:", genesisBlock?.number, genesisBlock?.id);