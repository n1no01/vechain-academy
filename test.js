import fs from "fs";
import { ThorClient } from "@vechain/sdk-network";
import { ERC20_ABI, Clause, ABIFunction } from "@vechain/sdk-core";

const thor = ThorClient.at("https://mainnet.vechain.org");

// B3TR token contract address on mainnet
const b3trContractAddress = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";

// Load and parse JSON file
const data = JSON.parse(fs.readFileSync("stargate_wallets.json", "utf8"));
const addresses = data.unique_addresses;

// Define balanceOf ABI for ERC20 using ABIFunction
const balanceOfAbi = new ABIFunction({
  name: "balanceOf",
  inputs: [{ name: "_owner", type: "address" }],
  outputs: [{ name: "balance", type: "uint256" }],
  constant: true,
  payable: false,
  type: "function",
});

// Fetch all balances in batches
console.log("Fetching B3TR balances...");
const b3trBalances = [];
const vetBalances = [];
const vthoBalances = [];
const hasCodeFlags = [];

// Process addresses in batches of 100
for (let i = 0; i < addresses.length; i += 100) {
  const chunk = addresses.slice(i, i + 100);

  // Create clauses for B3TR balances
  const b3trClauses = [];
  for (let j = 0; j < chunk.length; j++) {
    const clause = {
      clause: Clause.callFunction(b3trContractAddress, balanceOfAbi, [
        addresses[i + j],
      ]),
      functionAbi: balanceOfAbi,
    };
    b3trClauses.push(clause);
  }

  // Fetch B3TR balances
  try {
    const b3trResults = await thor.transactions.executeMultipleClausesCall(
      b3trClauses
    );
    for (const res of b3trResults) {
      b3trBalances.push(Number(res.result.plain) / 1e18);
    }
  } catch (error) {
    console.error(
      `Error fetching B3TR balances for batch starting at ${i}:`,
      error
    );
    // Fill with zeros for this batch
    for (let k = 0; k < chunk.length; k++) {
      b3trBalances.push(0);
    }
  }

  // Fetch VET/VTHO balances and account info in parallel
  const accountPromises = chunk.map((addr) => thor.accounts.getAccount(addr));
  try {
    const accounts = await Promise.all(accountPromises);

    for (const account of accounts) {
      const vetBalance = BigInt(account.balance) / 1000000000000000000n;
      const vthoBalance = BigInt(account.energy) / 1000000000000000000n;

      vetBalances.push(vetBalance);
      vthoBalances.push(vthoBalance);
      hasCodeFlags.push(account.hasCode);
    }
  } catch (error) {
    console.error(
      `Error fetching account data for batch starting at ${i}:`,
      error
    );
    // Fill with zeros for this batch
    for (let k = 0; k < chunk.length; k++) {
      vetBalances.push(0n);
      vthoBalances.push(0n);
      hasCodeFlags.push(false);
    }
  }

  console.log(
    `Processed ${Math.min(i + 100, addresses.length)}/${
      addresses.length
    } addresses`
  );
}

console.log("All balances fetched successfully");

// Prepare CSV header
let csv =
  "address,balance,energy,hasCode,VET Balance,VTHO Balance, B3TR Balance\n";

// Generate CSV data
for (let i = 0; i < addresses.length; i++) {
  const addr = addresses[i];
  const vetBalance = vetBalances[i] || 0n;
  const vthoBalance = vthoBalances[i] || 0n;
  const b3trBalance = b3trBalances[i] || 0;
  const hasCode = hasCodeFlags[i] || false;

  // Append a line to the CSV
  csv += `${addr},0x0,0x0,${hasCode},${vetBalance},${vthoBalance},${b3trBalance}\n`;
}

// Write CSV file
fs.writeFileSync("accounts.csv", csv, "utf8");

console.log("✅ CSV saved as accounts.csv");
