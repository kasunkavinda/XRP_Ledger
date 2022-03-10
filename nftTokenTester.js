if (typeof module !== "undefined") var xrpl = require("xrpl");

//***************************
//** Mint Token *************
//***************************

async function mintToken() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");

  // Note that you must convert the token URL to a hexadecimal
  // value for this transaction.
  // ----------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex(tokenUrl.value),
    Flags: parseInt(flags.value),
    TokenTaxon: 0, //Required, but if you have no use for it, set to zero.
  };
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });

  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(nfts);

  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult);
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
} //End of mintToken

//***************************
//** Get Tokens *************
//***************************

async function getTokens() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(nfts);
  client.disconnect();
} //End of getTokens

//***************************
//** Burn Token *************
//***************************

async function burnToken() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenBurn",
    Account: wallet.classicAddress,
    TokenID: tokenId.value,
  };

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(nfts);
  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult);
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
}
// End of burnToken()

//********************************
//** Create Sell Offer ***********
//********************************

async function createSellOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenCreateOffer",
    Account: wallet.classicAddress,
    TokenID: tokenId.value,
    Amount: amount.value,
    Flags: parseInt(flags.value),
  };

  // Submit signed blob --------------------------------------------------------

  const tx = await client.submitAndWait(transactionBlob, { wallet }); //AndWait

  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of createSellOffer()
}
//********************************
//** Create Buy Offer ***********
//********************************

async function createBuyOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("kasun");
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenCreateOffer",
    Account: wallet.classicAddress,
    Owner: owner.value,
    TokenID: tokenId.value,
    Amount: amount.value,
    Flags: parseInt(flags.value),
  };

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });

  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of createBuyOffer()
}

//***************************
//** Cancel Offer ***********
//***************************

async function cancelOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");

  const tokenID = tokenOfferIndex.value;
  const tokenIDs = [tokenID];

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenCancelOffer",
    Account: wallet.classicAddress,
    TokenIDs: tokenIDs,
  };

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });

  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));

  // Check transaction results -------------------------------------------------

  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );

  client.disconnect();
  // End of cancelOffer()
}
//***************************
//** Get Offers *************
//***************************

async function getOffers() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");
  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      tokenid: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));
  client.disconnect();
  // End of getOffers()
}
//***************************
//** Accept Sell Offer ******
//***************************

async function acceptSellOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenAcceptOffer",
    Account: wallet.classicAddress,
    SellOffer: tokenOfferIndex.value,
  };
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(JSON.stringify(nfts, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of acceptSellOffer()
}
//***************************
//** Accept Buy Offer ******
//***************************

async function acceptBuyOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenAcceptOffer",
    Account: wallet.classicAddress,
    BuyOffer: tokenOfferIndex.value,
  };
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(JSON.stringify(nfts, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of submitTransaction()
}
