import { ThorClient } from '@vechain/sdk-network';
import pkg from '@vechain/sdk-core';
const { abi } = pkg;

const thor = ThorClient.fromUrl('https://mainnet.vechain.org');

const main = async () => {
  // Step 1: Query logs without filters (optional)
  const logs = await thor.logs.filterRawEventLogs({
    options: {
      offset: 0,
      limit: 3,
    },
    criteriaSet: [
      {
        address: '0x0000000000000000000000000000456e65726779', // Replace with a valid contract address
      },
    ],
    order: 'asc',
  });

  // Step 2: Create an Event instance using the correct method
  const event = abi.eventFromSignature(
    'Transfer(address indexed from, address indexed to, uint256 amount)'
  );

    // Step 3: Encode filter topics
  const encodedTopics = event.encodeFilterTopics([
    null, // from (ignored)
    '0x0000000000000000000000000000456e65726779', // to
  ]);

  // Step 4: Filter logs with topics
  const criteria = {
    address: '0x0000000000000000000000000000456e65726779', // Replace with real address
  };

  encodedTopics.forEach((topic, index) => {
    criteria[`topic${index}`] = topic;
  });

  const filteredLogs = await thor.logs.filterRawEventLogs({
    criteriaSet: [criteria],
    order: 'asc',
    range: {
      unit: 'block',
      from: 0,
      to: 10000000,
    },
    options: {
      offset: 0,
      limit: 1,
    },
  });

  if (filteredLogs.length === 0) {
    console.log('No matching logs found.');
    return;
  }

  // Step 5: Decode the event log
  try {
    const [decodedLog] = filteredLogs.map((log) =>
      event.decodeEventLog(log)
    );

    console.log(
      'From:',
      decodedLog.from,
      'To:',
      decodedLog.to,
      'Amount:',
      decodedLog.amount.toString()
    );
  } catch (err) {
    console.error('Failed to decode event log:', err);
  }
};

main().catch((err) => console.error('Error in main():', err));