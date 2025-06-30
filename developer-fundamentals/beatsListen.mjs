import { subscriptions } from '@vechain/sdk-network';
import pkg from '@vechain/sdk-core';
const { bloomUtils } = pkg;
import WebSocket from 'ws';

const textEncoder = new TextEncoder();

const addressToTest = '0x0000000000000000000000000000000000000000';

// encode the word "Energy" that maps to the VTHO Energy contract
const dataToTest = `0x${Buffer.from(textEncoder.encode('Energy')).toString(
  'hex'
)}`;

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getBeatSubscriptionUrl(
  'https://mainnet.vechain.org'
);

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('Connected to', wsUrl);
};

ws.onmessage = async (message) => {
  const block = JSON.parse(message.data);
  console.log('New block', block);

  console.log(
    'Interaction with address found',
    bloomUtils.isAddressInBloom(block.bloom, block.k, addressToTest)
  );

  console.log(
    'Interaction with data found',
    bloomUtils.isInBloom(block.bloom, block.k, dataToTest)
  );
};