import { subscriptions } from '@vechain/sdk-network';
import pkg from '@vechain/sdk-core';
const { coder } = pkg;
import WebSocket from 'ws';

// create an interface for the contract events to listen
const contractInterface = coder.createInterface([
  'event Transfer (address indexed from, address indexed to, uint256 value)',
]);

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getEventSubscriptionUrl(
  // the node to connect to
  'https://mainnet.vechain.org',

  // the event signature
  contractInterface.getEvent('Transfer'),

  // optional filters in the same order as defined in the interface,
  [],

  // optional filters where the events should start or which emitting contract to filter for
  {
    address: '0x0000000000000000000000000000456e65726779',
  }
);

// connect the WebSocket
console.log('Connecting to', wsUrl);
const ws = new WebSocket(wsUrl);

// handle incoming messages
ws.onmessage = (message) => {
  // data is received as text and needs to be converted into an object first
  console.log('Received data', message.data);
  const eventLog = JSON.parse(message.data);

  try {
    const decoded = contractInterface.parseLog(eventLog);
    if (!decoded || decoded?.name !== 'Transfer') {
      throw new Error('Unknown Event');
    }

    console.log(
      'Found TxId',
      eventLog.meta.txID,
      decoded.args.value,
      'from',
      decoded.args.from,
      'to',
      decoded.args.to
    );
  } catch (err) {
    console.log(
      'Ignoring TxId',
      eventLog.meta.txID,
      'because decoding failed',
      err.message
    );
  }
};

// some helper to debug the websocket activity
ws.onopen = () => {
  console.log('Connected, listening for new Events');
};
ws.onclose = () => {
  console.log('Disconnected');
};
ws.onerror = (err) => {
  console.error(err);
};
