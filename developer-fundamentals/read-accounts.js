import { ThorClient } from '@vechain/sdk-network';
const nodeUrl = 'https://mainnet.vechain.org';

console.log('Connecting to', nodeUrl);
const thor = ThorClient.at(nodeUrl);

// get a contract account
const contract = await thor.accounts.getAccount(
  '0x0000000000000000000000000000456e65726779'
);
const bytecode = await thor.accounts.getBytecode(
  '0x0000000000000000000000000000456e65726779'
);
  console.log(contract, bytecode);

// example account
const example = await thor.accounts.getAccount(
  '0x0000000000000000000000000000000000000000'
);
    console.log(example);
    console.log('VET Balance', BigInt(example.balance)/1000000000000000000n );
    console.log('VTHO Balance', BigInt(example.energy)/1000000000000000000n );