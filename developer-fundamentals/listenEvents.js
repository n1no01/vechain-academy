import { subscriptions } from '@vechain/sdk-network';
import WebSocket from 'ws';

const wsUrl = subscriptions.getEventSubscriptionUrl(
  'https://mainnet.vechain.org',
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  [],
  { address: '0x0000000000000000000000000000456e65726779' }
);

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('Connected to', wsUrl);
};

ws.onmessage = (message) => {
  const eventLog = JSON.parse(message.data);
  console.log('Received data', eventLog);
};