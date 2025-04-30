const express = require("express");
const router = express.Router();
const axios = require("axios");

const ERCASPAY_SECRET_KEY = process.env.ERCASPAY_SECRET_KEY;

// Initiate payment
router.post("/initiate-payment", async (req, res) => {
  const payload = req.body;

  try {
    const response = await axios.post(
      "https://api.ercaspay.com/api/v1/payment/initiate", // ← ERCASPAY endpoint
      payload,
      {
        headers: {
          Authorization: `Bearer ${ERCASPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "ERCASPAY INIT ERROR:",
      error?.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error?.response?.data || error.message,
    });
  }
});

router.get("/verify-payment", async (req, res) => {
  const { transactionRef } = req.query;

  if (!transactionRef) {
    return res.status(400).json({ message: "Missing payment reference" });
  }

  try {
    const response = await axios.get(
      `https://api.ercaspay.com/api/v1/payment/transaction/verify/${transactionRef}`, // ← ERCASPAY endpoint
      {
        headers: {
          Authorization: `Bearer ${process.env.ERCASPAY_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    log("ERCASPAY VERIFY RESPONSE:", data);

    if (
      data?.responseMessage === "Transaction fetched successfully" &&
      data?.responseBody?.status === "SUCCESSFUL"
    ) {
      return res.status(200).json({
        success: true,
        status: data.responseBody.status,
        amount: data.responseBody.amount,
        metadata: data.responseBody.metadata,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: data.responseBody?.status || "UNKNOWN",
        message: "Payment not successful",
      });
    }
  } catch (error) {
    console.error(
      "Error verifying ERCASPAY payment:",
      error?.response?.data || error.message
    );
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
