exports.initiatePaystackTransfer = functions.https.onCall(
  async (data, context) => {
    const { amount, bankCode, accountNumber, accountName, userId, email } =
      data;

    if (!amount || !bankCode || !accountNumber || !accountName || !userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required data."
      );
    }

    const PAYSTACK_SECRET = "sk_test_823c00f95a55e269a4cc676e4ca8dc220dafdde1"; // Replace this

    try {
      // 1. Create Transfer Recipient
      const recipientRes = await axios.post(
        "https://api.paystack.co/transferrecipient",
        {
          type: "nuban",
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      const recipientCode = recipientRes.data.data.recipient_code;

      // 2. Initiate Transfer
      const transferRes = await axios.post(
        "https://api.paystack.co/transfer",
        {
          source: "balance",
          amount: Number(amount) * 100, // Paystack uses kobo
          recipient: recipientCode,
          reason: `Withdrawal for ${email}`,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        status: "success",
        transferCode: transferRes.data.data.transfer_code,
        transferDetails: transferRes.data.data,
      };
    } catch (error) {
      console.error(
        "Paystack Transfer Error:",
        error.response?.data || error.message
      );
      throw new functions.https.HttpsError("internal", "Transfer failed.");
    }
  }
);
