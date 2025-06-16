import { subscriptions } from '@vechain/sdk-network';
import WebSocket from 'ws';

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getVETtransfersSubscriptionUrl(
  'https://mainnet.vechain.org',

  // optional options, define one or more attributes
  {
    blockID: undefined, // block id to start from, defaults to the best block.
    signerAddress: undefined, // The address of the signer/origin of the transaction to filter transfers by.
    sender: undefined, // The sender address to filter transfers by.
    recipient: undefined, // The recipient address to filter transfers by.
  }
);

// connect the WebSocket
console.log('Connecting to', wsUrl);
const ws = new WebSocket(wsUrl);

// handle incoming messages
ws.onmessage = (message) => {
  // data is received as text and needs to be converted into an object first
  console.log('Received data', message.data);
  const transferLog = JSON.parse(message.data);

  try {
    console.log(
      'Found TxId',
      transferLog.meta.txID,
      BigInt(transferLog.amount),
      'VET',
      'from',
      transferLog.sender,
      'to',
      transferLog.recipient
    );
  } catch (err) {
    console.log(
      'Ignoring TxId',
      transferLog.meta.txID,
      'because decoding failed',
      err.message
    );
  }
};

// some helper to debug the websocket activity
ws.onopen = () => {
  console.log('Connected, listening for new Transfers');
};
ws.onclose = () => {
  console.log('Disconnected');
};
ws.onerror = (err) => {
  console.error(err);
};
