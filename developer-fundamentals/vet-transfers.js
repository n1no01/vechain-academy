import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

const logs = await thor.logs.filterTransferLogs({
  options: {
    offset: 0,
    limit: 3,
  },
  range: {
    unit: 'block',
    from: 1900000,
    to: 20000000,
  },
  criteriaSet: [
    {
      recipient: null,

      txOrigin: null,

      sender: null,
    },
  ],
  order: 'asc',
});

console.log('Retrieved VET transfer logs:', logs);