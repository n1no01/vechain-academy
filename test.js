import fs from 'fs';
import { ThorClient } from '@vechain/sdk-network';

const thor = ThorClient.at('https://mainnet.vechain.org');

// Load and parse JSON file
const data = JSON.parse(fs.readFileSync('stargate_wallets.json', 'utf8'));
const addresses = data.unique_addresses;

// Prepare CSV header
let csv = 'address,balance,energy,hasCode,VET Balance,VTHO Balance, B3TR Balance\n';

for (const addr of addresses) {
  const account = await thor.accounts.getAccount(addr);

  const vetBalance = BigInt(account.balance) / 1000000000000000000n;
  const vthoBalance = BigInt(account.energy) / 1000000000000000000n;

  // Append a line to the CSV
  csv += `${addr},${account.balance},${account.energy},${account.hasCode},${vetBalance},${vthoBalance}\n`;
}

// Write CSV file
fs.writeFileSync('accounts.csv', csv, 'utf8');

console.log('✅ CSV saved as accounts.csv');
