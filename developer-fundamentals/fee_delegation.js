import { ThorClient, ProviderInternalBaseWallet, VeChainProvider } from '@vechain/sdk-network';
import { Clause, ABIFunction, Transaction, HexUInt } from '@vechain/sdk-core';
import { Wallet as EthersWallet } from 'ethers';

const thor = ThorClient.at('https://testnet.vechain.org/');

// Clauses
const clauses = [
    Clause.callFunction(
        '0x8384738c995d49c5b692560ae688fc8b51af1059',
        new ABIFunction({
            name: 'increment',
            inputs: [],
            outputs: [],
            constant: false,
            payable: false,
            type: 'function',
        })
    ),
];

//Prepare Wallet
const mnemonic = 'subject stuff frame social gasp thought proud shift coffee hero defense survey';
const ethersWallet = EthersWallet.fromPhrase(mnemonic);
const privateKey = ethersWallet.privateKey.slice(2);
const senderAddress = ethersWallet.address.toLowerCase();

//Calculate Gas
const gasResult = await thor.transactions.estimateGas(clauses);

//Build Transaction with fee delegation
const tx = await thor.transactions.buildTransactionBody( clauses, gasResult.totalGas,
    { isDelegated: true }
);

// Sign Transaction. Needs 4 steps
//Step 1: Get signer
const wallet = new ProviderInternalBaseWallet(
  [{ privateKey: privateKey, address: senderAddress }],
  {
    gasPayer: {
      gasPayerServiceUrl: 'https://sponsor-testnet.vechain.energy/by/90',
    },
  }
);

const provider = new VeChainProvider(
  thor,
  wallet,
  // Enable fee delegation
 true
);

const signer = await provider.getSigner(senderAddress);

// Step 2: Sign transaction
const rawSignedTx = await signer.signTransaction(tx, privateKey);

// Step 3: Build Signed Transaction Object
const signedTx = Transaction.decode(
  HexUInt.of(rawSignedTx).bytes,
  true
);

// Step 4: Send Transaction
const sendTransactionResult = await thor.transactions.sendTransaction(signedTx);

// Wait for results
const txReceipt = await thor.transactions.waitForTransaction(
  sendTransactionResult.id
);
console.log(txReceipt);