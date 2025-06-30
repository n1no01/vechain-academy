import { ThorClient } from '@vechain/sdk-network';

const thor = ThorClient.at('https://mainnet.vechain.org');

const compressed = await thor.blocks.getBlockCompressed(12345678);
// console.log(compressed);

const expanded = await thor.blocks.getBlockExpanded(12345678);
console.log(expanded);