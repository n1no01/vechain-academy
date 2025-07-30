import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

const logs = await thor.logs.filterTransferLogs({
    criteriaSet: [
    {
      recipient: '0x000000000000000000000000000000000000dead',

      txOrigin: '0x19135a7c5c51950b3aa4b8de5076dd7e5fb630d4',

      sender: '0x19135a7c5c51950b3aa4b8de5076dd7e5fb630d4',
    },
  ],
    range: {
    unit: 'block',
    from: 0,
    to: 20000000,
  },
  options: {
    offset: 0,
    limit: 1,
  },
  order: 'asc',
});

console.log('Retrieved VET transfer logs:', logs);