const { initializeApp, cert } = require("firebase-admin/app");
const {
  getFirestore,
  FieldValue,
  increment,
} = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function trackInvestments() {
  console.log("Running investment tracker...");

  const usersSnapshot = await db.collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const userRef = userDoc.ref;
    const investmentsRef = userRef.collection("investments");
    const investmentsSnapshot = await investmentsRef.get();

    for (const investmentDoc of investmentsSnapshot.docs) {
      const inv = investmentDoc.data();
      const now = new Date();

      const startRaw =
        inv.productName === "Fast Vegetables"
          ? inv.createdAt?.toDate?.()
          : inv.startDate?.toDate?.();
      if (!startRaw) continue;

      const start = new Date(startRaw);
      const totalDays =
        inv.productName === "Fast Vegetables"
          ? inv.investmentPeriod
          : inv.investmentPeriod * 30;
      const elapsedDays = (now - start) / (1000 * 60 * 60 * 24);

      if (inv.status === "Pending" && now >= start) {
        await investmentDoc.ref.update({ status: "Active" });
      }

      if (elapsedDays >= totalDays && inv.status === "Active") {
        const roi = (inv.investmentAmount * inv.expectedROI) / 100;
        const totalReturn = inv.investmentAmount + roi;

        await userRef.update({
          availableBalance: increment(totalReturn),
          investmentBalance: increment(-inv.investmentAmount),
        });

        await investmentDoc.ref.update({
          status: "Completed",
          completedAt: new Date(),
        });

        console.log(
          `Updated investment: ${investmentDoc.id} for user ${userDoc.id}`
        );
      }
    }
  }

  console.log("Tracking completed.");
}

trackInvestments().catch((err) => console.error("Tracking failed:", err));
