import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

// const tx = await thor.transactions.getTransaction(
//     '0xae64634e1dc616444dee8c6a6a75085474cf2ecc7ada4f8cd339783fb4591552'
// );
// console.log(tx);

const txReceipt = await thor.transactions.getTransactionReceipt(
    '0xae64634e1dc616444dee8c6a6a75085474cf2ecc7ada4f8cd339783fb4591552'
);
console.log(txReceipt);
