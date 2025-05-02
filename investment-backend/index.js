const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get("/", (req, res) => {
  res.send("Investment tracker backend running.");
});

// Utility function to calculate progress
const getProgress = (inv, now) => {
  const startRaw =
    inv.productName === "Fast Vegetables" ? inv.createdAt : inv.startDate;
  const start = startRaw.toDate ? startRaw.toDate() : new Date(startRaw);

  const totalDays =
    inv.productName === "Fast Vegetables"
      ? inv.investmentPeriod
      : inv.investmentPeriod * 30;

  const duration = totalDays * 24 * 60 * 60 * 1000;
  const elapsed = now - start;
  const percentage = (elapsed / duration) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

app.get("/process-investments", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const now = new Date();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      const investmentsRef = db
        .collection("users")
        .doc(userId)
        .collection("investments");
      const investmentsSnapshot = await investmentsRef.get();

      for (const invDoc of investmentsSnapshot.docs) {
        const inv = invDoc.data();
        const invRef = invDoc.ref;

        if (!inv.startDate && !inv.createdAt) continue;

        const progress = getProgress(inv, now);

        if (
          progress >= 100 &&
          inv.status === "Active" &&
          typeof inv.investmentAmount === "number" &&
          typeof inv.expectedROI === "number"
        ) {
          const roi = (inv.investmentAmount * inv.expectedROI) / 100;
          const totalReturn = inv.investmentAmount + roi;

          // Update user balances
          await db
            .collection("users")
            .doc(userId)
            .update({
              availableBalance:
                admin.firestore.FieldValue.increment(totalReturn),
              investmentBalance: admin.firestore.FieldValue.increment(
                -inv.investmentAmount
              ),
            });

          // Mark investment as completed
          await invRef.update({
            status: "Completed",
            completedAt: now,
          });

          console.log(`✔ Updated investment for ${userId} (${invDoc.id})`);
        }

        // Optional: Activate pending investment
        const start = inv.startDate?.toDate?.() || new Date(inv.createdAt);
        if (now >= start && inv.status === "Pending") {
          await invRef.update({ status: "Active" });
          console.log(`🟢 Activated investment for ${userId} (${invDoc.id})`);
        }
      }
    }

    res.status(200).send("Processed all investments.");
  } catch (err) {
    console.error("❌ Error processing investments:", err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
