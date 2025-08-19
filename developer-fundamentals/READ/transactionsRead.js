import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

// get a single transaction
const txId =
  process.argv[2] ??
'0xca4083fa3ad31d98e6ab353831ae22971d9a87b50ded8a4d271d921f10dd17d5';

// load transaction details
const tx = await thor.transactions.getTransaction(txId);
console.log(tx);

// load effected changes & outputs with the transaction
const txReceipt = await thor.transactions.getTransactionReceipt(txId);
// console.log(txReceipt);
