const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST allowed" });
  }

  const {
    amount,
    paymentReference,
    paymentMethods,
    customerName,
    customerEmail,
    customerPhoneNumber,
    redirectUrl,
    description,
    currency,
    feeBearer,
    metadata,
  } = req.body;

  const bodyData = {
    amount,
    paymentReference,
    paymentMethods,
    customerName,
    customerEmail,
    customerPhoneNumber,
    redirectUrl,
    description,
    currency,
    feeBearer,
    metadata,
  };

  try {
    const response = await fetch(
      "https://api.ercaspay.com/api/v1/payment/initiate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ERCAS_PAY_SECRET_KEY}`,
        },
        body: JSON.stringify(bodyData),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};
