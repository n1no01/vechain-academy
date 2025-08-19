import { subscriptions } from '@vechain/sdk-network';
import pkg from '@vechain/sdk-core';
const { bloomUtils } = pkg;
import WebSocket from 'ws';

const textEncoder = new TextEncoder();

// address to look for, enter your own or a contract
const addressToTest = '0x0000000000000000000000000000000000000000';

// encode the word "Energy" that maps to the VTHO Energy contract
const dataToTest = `0x${Buffer.from(textEncoder.encode('Energy')).toString(
  'hex'
)}`;

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getBeatSubscriptionUrl(
  'https://mainnet.vechain.org'

  // optionally pass in { blockID: "0x.." } to continue at a specific block
);

// connect the WebSocket
console.log('Connecting to', wsUrl);
const ws = new WebSocket(wsUrl);

console.log('Looking for interaction with address', addressToTest);
console.log('Looking for interaction containing data', dataToTest);

// handle incoming messages
ws.onmessage = async (message) => {
  // data is received as text and needs to be converted into an object first
  console.log('Received data', message.data);
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

// some helper to debug the websocket activity
ws.onopen = () => {
  console.log('Connected, listening for new Blocks');
};
ws.onclose = () => {
  console.log('Disconnected');
};
ws.onerror = (err) => {
  console.error(err);
};
