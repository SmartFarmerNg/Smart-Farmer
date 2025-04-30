const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ERCASPAY_SECRET_KEY = process.env.ERCAS_PAY_SECRET_KEY;

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("ERCASPAY backend is running");
});

// Route to initiate payment
app.post("/api/ercaspay/initiate-payment", async (req, res) => {
  const depositData = req.body;
  console.log(depositData);

  // Validate required fields
  // const requiredFields = [
  //   "amount",
  //   "paymentReference",
  //   "paymentMethods",
  //   "customerName",
  //   "customerEmail",
  //   "currency",
  //   "customerPhoneNumber",
  //   "redirectUrl",
  //   "description",
  // ];

  // for (const field of requiredFields) {
  //   if (!depositData[field]) {
  //     return res
  //       .status(400)
  //       .json({ error: `Missing required field: ${field}` });
  //   }
  // }

  try {
    const response = await axios.post(
      "https://api.ercaspay.com/api/v1/payment/initiate",
      depositData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${ERCASPAY_SECRET_KEY}`,
        },
      }
    );

    console.log("Response from ERCASPAY:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error initiating ERCASPAY payment:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
