import {
  ThorClient,
  VeChainProvider,
  ProviderInternalBaseWallet,
  signerUtils,
} from '@vechain/sdk-network';
import {
  ABIFunction,
  Address,
  Clause,
  HexUInt,
  Secp256k1,
  Transaction,
} from '@vechain/sdk-core';
import express from 'express';

// setup simple express server
const app = express();
app.use(express.json());
app.listen(3000);

app.post('/', (req, res) => {
  console.log('Incoming request', req.body);
  const transactionToSign = Transaction.decode(
    HexUInt.of(req.body.raw).bytes
  );
  const delegatedHash = transactionToSign.getSignatureHash(req.body.origin);
  const signature = HexUInt.of(
    Secp256k1.sign(delegatedHash, delegatorPrivateKey)
  ).toString();
  console.log('Signature', signature);

  res.json({ signature });
});

// build a transaction, signed with url fee delegation
const thor = ThorClient.at('https://testnet.vechain.org/');
const privateKey = await Secp256k1.generatePrivateKey();
const senderAddress = Address.ofPrivateKey(privateKey).toString();
const delegatorPrivateKey = await Secp256k1.generatePrivateKey();
const tx = await generateSampleTransaction();

const providerWithDelegationEnabled = new VeChainProvider(
  thor,
  new ProviderInternalBaseWallet(
    [
      {
        privateKey: privateKey,
        address: senderAddress,
      },
    ],
    {
      gasPayer: { gasPayerServiceUrl: 'https://sponsor-testnet.vechain.energy/by/90' },
    }
  ),

  // Enable fee delegation
  true
);
const signedTx = await (
  await providerWithDelegationEnabled.getSigner(senderAddress)
).signTransaction(
  signerUtils.transactionBodyToTransactionRequestInput(tx, senderAddress)
);
process.exit(0);

async function generateSampleTransaction() {
  // generate random key for this script
  const privateKey = await Secp256k1.generatePrivateKey();

  // build instructions to execute
  const incrementAbi = new ABIFunction({
    name: 'increment',
    inputs: [],
    outputs: [],
    constant: false,
    payable: false,
    type: 'function',
  });
  const clauses = [
    Clause.callFunction(
      '0x8384738c995d49c5b692560ae688fc8b51af1059',
      incrementAbi
    ),
  ];

  // estimate how much gas the transaction will cost
  const gasResult = await thor.gas.estimateGas(clauses);

  // build a transaction
  const tx = await thor.transactions.buildTransactionBody(
    clauses,
    gasResult.totalGas,
    {
      isDelegated: true,
    }
  );

  return tx;
}