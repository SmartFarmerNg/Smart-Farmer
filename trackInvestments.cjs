const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function trackInvestments() {
  console.log("Running investment tracker...\n");

  const usersSnapshot = await db.collection("users").get();
  console.log(`Found ${usersSnapshot.size} users`);

  for (const userDoc of usersSnapshot.docs) {
    const userRef = userDoc.ref;
    const userId = userDoc.id;
    const investmentsRef = userRef.collection("investments");
    const investmentsSnapshot = await investmentsRef.get();

    if (investmentsSnapshot.empty) {
      console.log(`User ${userId} has 0 investments`);
      continue;
    }

    console.log(`User ${userId} has ${investmentsSnapshot.size} investments`);

    for (const investmentDoc of investmentsSnapshot.docs) {
      const inv = investmentDoc.data();
      const investmentId = investmentDoc.id;
      const now = new Date();

      console.log(`Checking investment ${investmentId} for user ${userId}`);
      console.log(`Status: ${inv.status}, Product: ${inv.productName}`);

      const startRaw =
        inv.productName === "Fast Vegetables"
          ? new Date(inv?.createdAt).toLocaleDateString()
          : new Date(inv?.startDate).toLocaleDateString();

      if (!startRaw) {
        console.log(
          `⚠️ Skipping investment ${investmentId}: invalid start date`
        );
        continue;
      }

      const start = new Date(startRaw);
      const totalDays =
        inv.productName === "Fast Vegetables"
          ? inv.investmentPeriod
          : inv.investmentPeriod * 30;

      const elapsedDays = (now - start) / (1000 * 60 * 60 * 24);

      // Activate pending investments that have reached their start date
      if (inv.status === "Pending" && now >= start) {
        await investmentDoc.ref.update({ status: "Active" });
        console.log(`✅ Activated investment ${investmentId}`);
        continue; // Don't process completion in same cycle
      }

      // Complete active investments that have reached maturity
      if (inv.status === "Active" && elapsedDays >= totalDays) {
        const roi = (inv.investmentAmount * inv.expectedROI) / 100;
        const totalReturn = inv.investmentAmount + roi;

        await userRef.update({
          availableBalance: FieldValue.increment(totalReturn),
          investmentBalance: FieldValue.increment(-inv.investmentAmount),
        });

        await investmentDoc.ref.update({
          status: "Completed",
          completedAt: new Date(),
        });

        console.log(
          `🎉 Completed investment ${investmentId} for user ${userId}`
        );
      }
    }
  }

  console.log("\n✅ Tracking completed.");
}

trackInvestments().catch((err) => {
  console.error("❌ Tracking failed:", err);
});
