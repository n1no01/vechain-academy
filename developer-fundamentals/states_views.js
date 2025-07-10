import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.at('https://mainnet.vechain.org');

const publicabi = await fetch('https://raw.githubusercontent.com/vechain/b32/master/ABIs/energy.json');
const energyAbi = await publicabi.json();

const vtho = thor.contracts.load(
  '0x0000000000000000000000000000456e65726779',
  energyAbi
);

// read name of contract
const name = await vtho.read.name();
console.log('Name', name);

// read balance of an address
const balanceNow = await vtho.read.balanceOf(
  '0x0000000000000000000000000000000000000000'
);
console.log('Balance Now', balanceNow);

// read balance of an address in the past
vtho.setContractReadOptions({ revision: 12345678 });
const balancePast = await vtho.read.balanceOf(
  '0x0000000000000000000000000000000000000000'
);
console.log('Balance Past', balancePast);
vtho.setContractReadOptions({ revision: null });

// simulate a transfer
const transfer = await vtho.read.transfer(
  '0x0000000000000000000000000000456e65726779',
  '1'
);
console.log('Transfer Test', transfer);

// failing simulation of transfer
try {
  vtho.setContractReadOptions({
    caller: '0x0000000000000000000000000000000000000003',
  });
  const failingTransfer = await vtho.read.transfer(
    '0x0000000000000000000000000000456e65726779',
    '1'
  );
  console.log('Failed Transfer Test', failingTransfer);
} catch (err) {
  const errorDecoder = ErrorDecoder.create();
  const decodedError = await errorDecoder.decode(err);
  console.log(`Revert reason: ${decodedError.reason}`);
}
