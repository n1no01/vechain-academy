import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

// get a single transaction
const txId =
  process.argv[2] ??
'0x1f5853416d3a48015bb7964f6d4a70cf0ff2774d99287e888483eec59b433b56';

// load transaction details
const tx = await thor.transactions.getTransaction(txId);
console.log(tx);

// load effected changes & outputs with the transaction
const txReceipt = await thor.transactions.getTransactionReceipt(txId);
// console.log(txReceipt);
