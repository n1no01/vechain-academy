import { ThorClient, VeChainProvider, ProviderInternalBaseWallet } from "@vechain/sdk-network";
import { Clause, ABIFunction } from "@vechain/sdk-core";
import { Wallet as EthersWallet } from 'ethers';

const thor = ThorClient.at('https://testnet.vechain.org/');

// const senderAddress = process.env.MNEMONIC;

const mnemonic = process.env.MNEMONIC;
// const ethersWallet = EthersWallet.fromPhrase(mnemonic);
// const privateKey = ethersWallet.privateKey.slice(2);
// const senderAddress = ethersWallet.address.toLowerCase();
console.log(mnemonic);

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

const gasResult = await thor.transactions.estimateGas(clauses);

const tx = await thor.transactions.buildTransactionBody(clauses,gasResult.totalGas);

const wallet = new ProviderInternalBaseWallet(
  [{ privateKey, address: senderAddress }]
);

const provider = new VeChainProvider(
  // Thor client used by the provider
  thor,

  // Internal wallet used by the provider (needed to call the getSigner() method)
  wallet,

  // Enable fee delegation
  false
);

const signer = await provider.getSigner(senderAddress);

const rawSignedTx = await signer.signTransaction(tx, privateKey);

const signedTx = Transaction.decode(
  HexUInt.of(rawSignedTx).bytes,
  true
);

const sendTransactionResult = await thor.transactions.sendTransaction(signedTx);

const txReceipt = await thor.transactions.waitForTransaction(
  sendTransactionResult.id
);

// console.log(txReceipt);