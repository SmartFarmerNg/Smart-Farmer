// functions/index.js or functions/withdraw.js
const functions = require("firebase-functions");
const axios = require("axios");
require("dotenv").config();

exports.withdrawWithPaystack = functions.https.onCall(async (data, context) => {
  const { bankCode, accountNumber, amount, userEmail } = data;

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. Create Transfer Recipient
    const recipientRes = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name: userEmail,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      { headers }
    );

    const recipientCode = recipientRes.data.data.recipient_code;

    // 2. Initiate Transfer
    const transferRes = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: amount * 100, // amount in kobo
        recipient: recipientCode,
        reason: "Withdrawal from app",
      },
      { headers }
    );

    return { success: true, transfer: transferRes.data.data };
  } catch (error) {
    console.error(
      "Paystack Withdrawal Error:",
      error.response?.data || error.message
    );
    throw new functions.https.HttpsError(
      "unknown",
      "Withdrawal failed. Try again."
    );
  }
});
