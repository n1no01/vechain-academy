import { subscriptions, ThorClient } from '@vechain/sdk-network';
import WebSocket from 'ws';

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getBlockSubscriptionUrl(
  'https://mainnet.vechain.org'

  // optionally pass in { blockID: "0x.." } to continue at a specific block
);

// connect the WebSocket
console.log('Connecting to', wsUrl);
const ws = new WebSocket(wsUrl);

// handle incoming messages
ws.onmessage = async (message) => {
  // data is received as text and needs to be converted into an object first
  console.log('Received data', message.data);
  const block = JSON.parse(message.data);

  console.log('New block', block);
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
