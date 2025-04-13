const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Cloud Function to check investments and activate them
exports.checkInvestmentStatus = functions.pubsub
  .schedule("every 24 hours") // Runs every 24 hours (you can adjust this)
  .onRun(async (context) => {
    const now = new Date();

    // Fetch all investments that are still in "Pending" status
    const investmentsSnapshot = await db
      .collectionGroup("investments")
      .where("status", "==", "Pending")
      .get();

    if (investmentsSnapshot.empty) {
      console.log("No pending investments found");
      return;
    }

    investmentsSnapshot.forEach(async (doc) => {
      const investment = doc.data();
      const startDate = investment.startDate?.toDate();

      // If the start date has passed and status is still "Pending", update it to "Active"
      if (startDate && now >= startDate) {
        console.log(`Activating investment ${doc.id}`);
        await doc.ref.update({
          status: "Active",
        });
      }
    });

    console.log("Checked all investments");
  });
