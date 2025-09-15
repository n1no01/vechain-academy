import { ThorClient } from '@vechain/sdk-network';

const thor = ThorClient.at('https://mainnet.vechain.org');

const account = await thor.accounts.getAccount(
  '0x03bbba6322fcbdc129f032c61547eeb9590651ce'
);

console.log(account);
console.log('VET Balance', BigInt(account.balance)/1000000000000000000n );
console.log('VTHO Balance', BigInt(account.energy)/1000000000000000000n );