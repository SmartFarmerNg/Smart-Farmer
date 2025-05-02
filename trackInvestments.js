const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const run = async () => {
  const usersSnapshot = await db.collection("users").get();

  const now = new Date();

  for (const userDoc of usersSnapshot.docs) {
    const userRef = userDoc.ref;
    const userData = userDoc.data();
    const userId = userDoc.id;

    const investmentsRef = db
      .collection("users")
      .doc(userId)
      .collection("investments");
    const investmentsSnapshot = await investmentsRef.get();

    for (const investmentDoc of investmentsSnapshot.docs) {
      const inv = investmentDoc.data();
      const invRef = investmentDoc.ref;

      const startRaw =
        inv.productName === "Fast Vegetables" ? inv.createdAt : inv.startDate;
      const start = startRaw.toDate();
      const totalDays =
        inv.productName === "Fast Vegetables"
          ? inv.investmentPeriod
          : inv.investmentPeriod * 30;
      const duration = totalDays * 24 * 60 * 60 * 1000;
      const elapsed = now - start;
      const percentage = (elapsed / duration) * 100;
      const daysLeft = Math.max(
        0,
        Math.ceil(totalDays - elapsed / (1000 * 60 * 60 * 24))
      );

      if (start <= now && inv.status === "Pending") {
        await invRef.update({ status: "Active" });
      }

      if (percentage >= 100 && daysLeft === 0 && inv.status === "Active") {
        const roi = (inv.investmentAmount * inv.expectedROI) / 100;
        const totalReturn = inv.investmentAmount + roi;

        await userRef.update({
          availableBalance: FieldValue.increment(totalReturn),
          investmentBalance: FieldValue.increment(-inv.investmentAmount),
        });

        await invRef.update({
          status: "Completed",
          completedAt: new Date(),
        });

        console.log(`Investment completed for user ${userId}`);
      }
    }
  }

  console.log("All done ✅");
};

run().catch(console.error);
