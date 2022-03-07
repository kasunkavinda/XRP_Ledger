const xrpl = require("xrpl");

async function main() {
  // Define the network client
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  // ... custom code goes here
  const fund_result = await client.fundWallet();
  const test_wallet = fund_result.wallet;

  const response = await client.request({
    command: "account_info",
    account: test_wallet.address,
    ledger_index: "validated",
  });
  // Listen to ledger close events
  client.request({
    command: "subscribe",
    streams: ["ledger"],
  });
  console.log(client.getBalances());
  client.on("ledgerClosed", async (ledger) => {
    console.log(
      `Ledger #${ledger.ledger_index} validated with ${ledger.txn_count} transactions!`
    );
  });

  // Disconnect when done (If you omit this, Node.js won't end the process)

  client.disconnect();
}

main();
