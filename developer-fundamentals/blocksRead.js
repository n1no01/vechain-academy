import { ThorClient } from '@vechain/sdk-network';

const thor = ThorClient.at('https://mainnet.vechain.org');

const compressed = await thor.blocks.getBlockCompressed(0x0155b66572a3da7e65c7acc345b4dd507dd6637e84053d92f0a2b7f5c1c325a9);
console.log(compressed);

const expanded = await thor.blocks.getBlockExpanded(0x0155b66572a3da7e65c7acc345b4dd507dd6637e84053d92f0a2b7f5c1c325a9);
// console.log(expanded);