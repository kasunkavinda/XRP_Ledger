// Import the library
const xrpl = require("xrpl");
const rippleKeypairs = require("ripple-keypairs");

// Wrap code in an async function so we can use await
async function main() {
  // Define the network client
  const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
  const client = new xrpl.Client(SERVER_URL);
  await client.connect();

  // Get credentials from the Testnet Faucet -----------------------------------
  console.log("Requesting addresses from the Testnet faucet...");
  const hot_wallet = (await client.fundWallet()).wallet;
  const cold_wallet = (await client.fundWallet()).wallet;
  console.log(
    `Got hot address ${hot_wallet.address} and cold address ${cold_wallet.address}.`
  );

  // Configure issuer (cold address) settings ----------------------------------
  const cold_settings_tx = {
    TransactionType: "AccountSet",
    Account: cold_wallet.address,
    TransferRate: 0, // equal to 1000000000 (1 billion) (means no fee)
    TickSize: 5,
    Domain: "6B6173756E6B6176696E64612E636F6D", // "kasunkavinda.com"
    SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
    // Using tf flags, we can enable more flags in one transaction
    Fee: "14", // my own fee defined
    Flags:
      xrpl.AccountSetTfFlags.tfDisallowXRP |
      xrpl.AccountSetTfFlags.tfRequireDestTag,
  };

  const cst_prepared = await client.autofill(cold_settings_tx);
  const cst_signed = cold_wallet.sign(cst_prepared);
  console.log("Sending cold address AccountSet transaction...");
  const cst_result = await client.submitAndWait(cst_signed.tx_blob);
  if (cst_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(
      `Transaction succeeded: https://testnet.xrpl.org/transactions/${cst_signed.hash}`
    );
  } else {
    throw `Error sending transaction: ${cst_result}`;
  }

  // Configure hot address settings --------------------------------------------

  const hot_settings_tx = {
    TransactionType: "AccountSet",
    Account: hot_wallet.address,
    Domain: "6B6173756E6B6176696E64612E636F6D", // "kasunkavinda.com"
    // enable Require Auth so we can't use trust lines that users
    // make to the hot address, even by accident:
    SetFlag: xrpl.AccountSetAsfFlags.asfRequireAuth,
    Flags:
      xrpl.AccountSetTfFlags.tfDisallowXRP |
      xrpl.AccountSetTfFlags.tfRequireDestTag,
  };

  const hst_prepared = await client.autofill(hot_settings_tx);
  const hst_signed = hot_wallet.sign(hst_prepared);
  console.log("Sending hot address AccountSet transaction...");
  const hst_result = await client.submitAndWait(hst_signed.tx_blob);
  if (hst_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(
      `Transaction succeeded: https://testnet.xrpl.org/transactions/${hst_signed.hash}`
    );
  } else {
    throw `Error sending transaction: ${hst_result.result.meta.TransactionResult}`;
  }

  // Create trust line from hot to cold address --------------------------------
  const currency_code = "KAS"; // my own token
  const trust_set_tx = {
    TransactionType: "TrustSet",
    Account: hot_wallet.address,
    LimitAmount: {
      currency: currency_code,
      issuer: cold_wallet.address,
      value: "10000000000", // Large limit, arbitrarily chosen
    },
  };

  const ts_prepared = await client.autofill(trust_set_tx);
  const ts_signed = hot_wallet.sign(ts_prepared);
  console.log("Creating trust line from hot address to issuer...");
  const ts_result = await client.submitAndWait(ts_signed.tx_blob);
  if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(
      `Transaction succeeded: https://testnet.xrpl.org/transactions/${ts_signed.hash}`
    );
  } else {
    throw `Error sending transaction: ${ts_result.result.meta.TransactionResult}`;
  }

  // Send token ----------------------------------------------------------------
  const issue_quantity = "3840";
  const send_token_tx = {
    TransactionType: "Payment",
    Account: cold_wallet.address,
    Amount: {
      currency: currency_code,
      value: issue_quantity,
      issuer: cold_wallet.address,
    },
    Destination: hot_wallet.address,
    DestinationTag: 1, // Needed since we enabled Require Destination Tags
    // on the hot account earlier.
  };

  const pay_prepared = await client.autofill(send_token_tx);
  const pay_signed = cold_wallet.sign(pay_prepared);
  console.log(
    `Sending ${issue_quantity} ${currency_code} to ${hot_wallet.address}...`
  );
  const pay_result = await client.submitAndWait(pay_signed.tx_blob);
  if (pay_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(
      `Transaction succeeded: https://testnet.xrpl.org/transactions/${pay_signed.hash}`
    );
  } else {
    throw `Error sending transaction: ${pay_result.result.meta.TransactionResult}`;
  }

  // Check balances ------------------------------------------------------------
  console.log("Getting hot address balances...");
  const hot_balances = await client.request({
    command: "account_lines",
    account: hot_wallet.address,
    ledger_index: "validated",
  });
  console.log(hot_balances.result);

  console.log("Getting cold address balances...");
  const cold_balances = await client.request({
    command: "gateway_balances",
    account: cold_wallet.address,
    ledger_index: "validated",
    hotwallet: [hot_wallet.address],
  });
  console.log(JSON.stringify(cold_balances.result, null, 2));

  // Disconnect when done so Node.js can end the process
  client.disconnect();
}

// call the async function
main();
