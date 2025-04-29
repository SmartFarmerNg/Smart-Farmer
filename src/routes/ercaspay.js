// server.js or routes/ercaspay.js
import express from "express";
import fetch from "node-fetch";
const router = express.Router();

const ERCASPAY_SECRET_KEY = process.env.VITE_ERCAS_PAY_SECRET_KEY; // load from environment variable

router.post("/initiate-payment", async (req, res) => {
  const depositData = req.body;

  try {
    const response = await fetch(
      "https://api.ercaspay.com/api/v1/payment/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ERCASPAY_SECRET_KEY}`,
        },
        body: JSON.stringify(depositData),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error initiating ERCASPAY payment:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

export default router;
