import { subscriptions, ThorClient } from '@vechain/sdk-network';
import WebSocket from 'ws';

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getNewTransactionsSubscriptionUrl(
  'https://mainnet.vechain.org'
);

// connect the WebSocket
console.log('Connecting to', wsUrl);
const ws = new WebSocket(wsUrl);
const thor = ThorClient.fromUrl('https://mainnet.vechain.org');

// handle incoming messages
ws.onmessage = async (message) => {
  // data is received as text and needs to be converted into an object first
  console.log('Received data', message.data);
  const addedTx = JSON.parse(message.data);
  console.log('New transaction', addedTx);
};

// some helper to debug the websocket activity
ws.onopen = () => {
  console.log('Connected, listening for new Transactions');
};
ws.onclose = () => {
  console.log('Disconnected');
};
ws.onerror = (err) => {
  console.error(err);
};
