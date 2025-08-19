import { ThorClient } from '@vechain/sdk-network';

const thor = ThorClient.at('https://mainnet.vechain.org');

const filteredLogs = await thor.logs.filterRawEventLogs({
  criteriaSet: [
    {
      address: '0x0000000000000000000000000000456e65726779',
    },
  ],
  range: {
    unit: 'block',
    from: 0,
    to: 10000000,
  },
  options: { limit: 3 },
});

console.log('Results', filteredLogs);