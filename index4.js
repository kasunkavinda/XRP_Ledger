// Import the library
const xrpl = require("xrpl");
const rippleKeypairs = require("ripple-keypairs");

// Wrap code in an async function so we can use await
async function main() {
  // Define the network client
  const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
  //   const SERVER_URL = "ws://localhost:6006/";
  //   const SERVER_URL = "wss://xrplcluster.com/";
  const client = new xrpl.Client(SERVER_URL);

  await client.connect();
  const seed = rippleKeypairs.generateSeed();
  const keypair = rippleKeypairs.deriveKeypair(seed);
  const publicAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
  const privateAddress = rippleKeypairs.deriveAddress(keypair.privateKey);
  //   console.log(`kasun seed ${seed}`);

  // Create a wallet and fund it with the Testnet faucet:
  //   const fund_result = await client.fundWallet();
  //   const test_wallet = fund_result.wallet;
  const test_wallet = xrpl.Wallet.fromSeed("sasDCQWDrg6BaL6GtpS7fA4iCEjZH"); // Test secret; don't use for real
  //   console.log(fund_result);
  //   console.log(test_wallet.address);

  //   console.log(`kasun ${test_wallet.}`, test_wallet);

  // Get info of from wallet
  const fromWalletResponse = await client.request({
    command: "account_info",
    account: test_wallet.address,
    ledger_index: "validated",
  });

  // Prepare transaction -------------------------------------------------------
  //   console.log(`kasun publicAddress ${publicAddress}`);
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: test_wallet.address,
    Amount: xrpl.xrpToDrops("10"),
    // Destination: "rLPGaNKjZNscoXknnZjmjDVvweQXdcVLq7",
    Destination: publicAddress,
  });
  const max_ledger = prepared.LastLedgerSequence;
  //   console.log("Prepared transaction instructions:", prepared);
  //   console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
  //   console.log("Transaction expires after ledger:", max_ledger);

  // Sign prepared instructions ------------------------------------------------
  const signed = test_wallet.sign(prepared);
  //   console.log("Identifying hash:", signed.hash);
  //   console.log("Signed blob:", signed.tx_blob);

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(signed.tx_blob);
  //   console.log(tx);
  // Listen to ledger close events
  client.request({
    command: "subscribe",
    streams: ["ledger"],
  });

  //   Get info of to wallet
  const toWalletResponse = await client.request({
    command: "account_info",
    account: publicAddress,
    ledger_index: "validated",
  });

  //balance of the wallet after happening the transaction
  console.log(
    `From wallet balance (${test_wallet.address}) ${xrpl.dropsToXrp(
      fromWalletResponse.result.account_data.Balance - prepared.Amount
    )}`
  );

  //new account balance
  console.log(
    `To wallet balance (${publicAddress}) ${xrpl.dropsToXrp(
      toWalletResponse.result.account_data.Balance
    )}`
  );

  client.on("ledgerClosed", async (ledger) => {
    console.log(
      `Ledger #${ledger.ledger_index} validated with ${ledger.txn_count} transactions!`
    );
  });

  // Disconnect when done so Node.js can end the process
  client.disconnect();
}

// call the async function
main();
