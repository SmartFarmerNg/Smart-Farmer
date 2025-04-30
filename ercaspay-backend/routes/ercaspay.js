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

module.exports = router;
