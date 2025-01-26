import cron from "node-cron";
import responseModel from "../../DB/models/Response.model.js";

export const startCleanupJob = () => {
  // Schedule a cron job to run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await responseModel.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });
      console.log(`Deleted ${result.deletedCount} old responses.`);
    } catch (error) {
      console.error("Error deleting old responses:", error);
    }
  });

  console.log("Cron job for cleaning old responses is running...");
};
