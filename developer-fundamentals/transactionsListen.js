import { subscriptions } from '@vechain/sdk-network';
import WebSocket from 'ws';

const wsUrl = subscriptions.getNewTransactionsSubscriptionUrl(
  'https://mainnet.vechain.org',
  {
    blockId: '0x0150be6faae18feaca872d82e51fdefd131f08a4b617f264fe0a13143b494441'
  }
);

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('Connected to', wsUrl);
};

ws.onmessage = (message) => {
  const addedTx = JSON.parse(message.data);
  console.log('New transaction', addedTx);
};
