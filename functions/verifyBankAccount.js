const functions = require("firebase-functions");
const axios = require("axios");

exports.verifyBankAccount = functions.https.onCall(async (data, context) => {
  const { accountNumber, bankCode } = data;

  if (!accountNumber || !bankCode) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing account number or bank code."
    );
  }

  try {
    const response = await axios.get(`https://api.paystack.co/bank/resolve`, {
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
      headers: {
        Authorization: `Bearer YOUR_PAYSTACK_SECRET_KEY`, // Replace this
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );
    throw new functions.https.HttpsError(
      "internal",
      "Account verification failed."
    );
  }
});
