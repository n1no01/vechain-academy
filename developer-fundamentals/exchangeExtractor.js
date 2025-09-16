import { ThorClient } from "@vechain/sdk-network";
import fs from "fs";

const thor = ThorClient.at("https://mainnet.vechain.org");

// Configuration for speed
const BATCH_SIZE = 100; // Process 100 wallets per batch
const CONCURRENT_REQUESTS = 20; // 20 parallel requests
const MAX_TRANSFERS_PER_WALLET = 50; // Limit transfers per wallet
const DELAY_BETWEEN_BATCHES = 500; // 500ms between batches

// Exchange wallets with aliases from wallets.json
let EXCHANGE_WALLETS = {};

// Results storage
let exchangeReceipts = [];
let processedWallets = 0;
let totalWallets = 0;

/**
 * Load StarGate wallets from JSON file
 */
function loadStarGateWallets() {
  try {
    const data = fs.readFileSync("../stargate_wallets.json", "utf8");
    const wallets = JSON.parse(data);
    return wallets.unique_addresses || [];
  } catch (error) {
    console.error("Error loading StarGate wallets:", error);
    return [];
  }
}

/**
 * Load exchange wallets with aliases from wallets.json
 */
function loadExchangeWallets() {
  try {
    const data = fs.readFileSync("../wallets.json", "utf8");
    const wallets = JSON.parse(data);

    // Filter wallets that have exchange-related aliases
    const exchangeWallets = {};

    for (const wallet of wallets) {
      if (wallet.alias && wallet.address) {
        const alias = wallet.alias.toLowerCase();

        // Check if alias contains exchange names
        if (
          alias.includes("binance") ||
          alias.includes("kucoin") ||
          alias.includes("huobi") ||
          alias.includes("okx") ||
          alias.includes("bybit") ||
          alias.includes("gate") ||
          alias.includes("mexc") ||
          alias.includes("crypto.com") ||
          alias.includes("bitfinex") ||
          alias.includes("kraken") ||
          alias.includes("coinbase") ||
          alias.includes("upbit") ||
          alias.includes("bittrex") ||
          alias.includes("poloniex") ||
          alias.includes("bitstamp") ||
          alias.includes("gemini")
        ) {
          exchangeWallets[wallet.address.toLowerCase()] = wallet.alias;
        }
      }
    }

    return exchangeWallets;
  } catch (error) {
    console.error("Error loading exchange wallets:", error);
    return {};
  }
}

/**
 * Check if an address is a known exchange
 */
function isExchangeAddress(address) {
  return EXCHANGE_WALLETS[address.toLowerCase()] || null;
}

/**
 * Get VET transfers where the wallet is the recipient (optimized for speed)
 */
async function getWalletReceipts(walletAddress) {
  try {
    // Use a fixed recent range for maximum speed
    const logs = await thor.logs.filterTransferLogs({
      criteriaSet: [
        {
          recipient: walletAddress,
        },
      ],
      range: {
        unit: "block",
        from: 19950000, // Very recent range for speed
        to: 20000000,
      },
      options: {
        offset: 0,
        limit: MAX_TRANSFERS_PER_WALLET,
      },
      order: "desc",
    });

    return logs || [];
  } catch (error) {
    return [];
  }
}

/**
 * Analyze transfers to find exchange receipts
 */
function analyzeReceiptsForExchanges(transfers, walletAddress) {
  const exchangeReceipts = [];

  for (const transfer of transfers) {
    const sender = transfer.sender;
    const exchangeName = isExchangeAddress(sender);

    if (exchangeName) {
      exchangeReceipts.push({
        stargateWallet: walletAddress,
        exchangeAddress: sender,
        exchangeName: exchangeName,
        amount: transfer.amount,
        blockNumber: transfer.meta.blockNumber,
        transactionId: transfer.meta.txID,
        timestamp: transfer.meta.blockTimestamp,
        transactionLink: `https://explore.vechain.org/transactions/${transfer.meta.txID}`,
      });
    }
  }

  return exchangeReceipts;
}

/**
 * Process a single wallet (optimized)
 */
async function processWallet(walletAddress) {
  try {
    const transfers = await getWalletReceipts(walletAddress);
    const walletExchangeReceipts = analyzeReceiptsForExchanges(
      transfers,
      walletAddress
    );
    return walletExchangeReceipts;
  } catch (error) {
    return [];
  }
}

/**
 * Process multiple wallets in parallel with concurrency control
 */
async function processWalletsInParallel(wallets) {
  const results = [];

  for (let i = 0; i < wallets.length; i += CONCURRENT_REQUESTS) {
    const batch = wallets.slice(i, i + CONCURRENT_REQUESTS);

    const promises = batch.map(async (walletAddress) => {
      const receipts = await processWallet(walletAddress);
      processedWallets++;

      if (receipts.length > 0) {
        console.log(
          `✅ ${walletAddress}: Found ${receipts.length} exchange receipts`
        );
      } else {
        console.log(`⚪ ${walletAddress}: No exchange activity`);
      }

      return receipts;
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.flat());

    // Progress update
    const progress = ((processedWallets / totalWallets) * 100).toFixed(1);
    console.log(
      `📊 Progress: ${processedWallets}/${totalWallets} (${progress}%)`
    );

    // Small delay between concurrent batches
    if (i + CONCURRENT_REQUESTS < wallets.length) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}

/**
 * Process wallets in batches
 */
async function processWalletsInBatches(wallets) {
  const totalBatches = Math.ceil(wallets.length / BATCH_SIZE);
  const allResults = [];

  for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batch = wallets.slice(i, i + BATCH_SIZE);

    console.log(
      `\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} wallets)...`
    );

    const batchResults = await processWalletsInParallel(batch);
    allResults.push(...batchResults);

    // Delay between batches
    if (i + BATCH_SIZE < wallets.length) {
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_BATCHES)
      );
    }
  }

  return allResults;
}

/**
 * Convert results to CSV format
 */
function convertToCSV(data) {
  if (data.length === 0) {
    return "stargate_wallet,exchange_name,exchange_address,amount,block_number,transaction_id,timestamp,transaction_link\n";
  }

  const headers = [
    "stargate_wallet",
    "exchange_name",
    "exchange_address",
    "amount",
    "block_number",
    "transaction_id",
    "timestamp",
    "transaction_link",
  ];

  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = [
      row.stargateWallet,
      `"${row.exchangeName}"`,
      row.exchangeAddress,
      row.amount,
      row.blockNumber,
      row.transactionId,
      row.timestamp,
      `"${row.transactionLink}"`,
    ];
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Save results to CSV and JSON files
 */
function saveResults(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const csvFilename = `stargate_exchange_receipts_${timestamp}.csv`;
  const jsonFilename = `stargate_exchange_receipts_${timestamp}.json`;

  // Save CSV
  const csvContent = convertToCSV(data);
  fs.writeFileSync(csvFilename, csvContent);
  console.log(`\n💾 CSV saved: ${csvFilename}`);

  // Save JSON summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalWallets: totalWallets,
    processedWallets: processedWallets,
    totalExchangeReceipts: data.length,
    uniqueExchanges: [...new Set(data.map((r) => r.exchangeName))],
    exchangeStats: getExchangeStats(data),
    receipts: data,
  };

  fs.writeFileSync(jsonFilename, JSON.stringify(summary, null, 2));
  console.log(`📊 JSON summary saved: ${jsonFilename}`);
}

/**
 * Get exchange statistics
 */
function getExchangeStats(data) {
  const stats = {};

  for (const receipt of data) {
    const exchange = receipt.exchangeName;
    if (!stats[exchange]) {
      stats[exchange] = {
        count: 0,
        totalAmount: 0,
        uniqueWallets: new Set(),
      };
    }

    stats[exchange].count++;
    stats[exchange].totalAmount += parseFloat(receipt.amount);
    stats[exchange].uniqueWallets.add(receipt.stargateWallet);
  }

  // Convert sets to counts
  for (const exchange in stats) {
    stats[exchange].uniqueWallets = stats[exchange].uniqueWallets.size;
  }

  return stats;
}

/**
 * Main analysis function
 */
async function analyzeStarGateExchangeReceipts() {
  console.log(
    "🚀 Starting FAST StarGate Wallet Exchange Receipt Analysis...\n"
  );
  console.log(
    "📋 Finding which StarGate wallets received VET from major exchanges\n"
  );

  // Load exchange wallets with aliases
  EXCHANGE_WALLETS = loadExchangeWallets();
  console.log(
    `🏦 Loaded ${
      Object.keys(EXCHANGE_WALLETS).length
    } exchange wallets with aliases\n`
  );

  // Load StarGate wallets
  const wallets = loadStarGateWallets();
  totalWallets = wallets.length;

  if (totalWallets === 0) {
    console.error("❌ No wallets found in stargate_wallets.json");
    return;
  }

  console.log(`📊 Processing ${totalWallets} StarGate wallets...\n`);
  console.log(`⚡ Using ${CONCURRENT_REQUESTS} parallel requests per batch\n`);

  const startTime = Date.now();

  try {
    // Process all wallets in parallel batches
    exchangeReceipts = await processWalletsInBatches(wallets);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`\n🎉 Analysis completed in ${duration} seconds!`);
    console.log(`📊 Processed ${processedWallets} wallets`);
    console.log(`💰 Found ${exchangeReceipts.length} exchange receipts`);

    if (exchangeReceipts.length > 0) {
      console.log(`\n🏆 Top exchanges:`);
      const stats = getExchangeStats(exchangeReceipts);
      const sortedExchanges = Object.entries(stats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10);

      for (const [exchange, data] of sortedExchanges) {
        console.log(
          `  ${exchange}: ${data.count} receipts from ${data.uniqueWallets} wallets`
        );
      }
    }

    // Save results
    saveResults(exchangeReceipts);
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

// Run analysis
analyzeStarGateExchangeReceipts().catch(console.error);
