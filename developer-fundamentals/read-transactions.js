import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

// get a single transaction
const txId =
  process.argv[2] ??
'0xfc99fe103fccbe61b3c042c1da3499b883d1b17fb40160ed1170ad5e63751e07';

// load transaction details
const tx = await thor.transactions.getTransaction(txId);
// console.log(tx);

// load effected changes & outputs with the transaction
const txReceipt = await thor.transactions.getTransactionReceipt(txId);
console.log(txReceipt);
