import cron from "node-cron";
import { prisma } from "../../HR/Lib/prisma.js";
import { redis } from "../../HR/Lib/redis.js";

export const CheckTaskDeadLine = () => {
  console.log("✅ Cron job started");

  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();

      const expiredTasks = await prisma.task.findMany({
        where: {
          deadline: { lte: now },
          status: "PENDING",
        },
        include: { developer: true },
      });

      for (const task of expiredTasks) {
        await redis.del(`magic:${task.developer.uniqueCode}`);

        await prisma.task.update({
          where: { id: task.id },
          data: { status: "EXPIRED" },
        });
      }

       console.log(" Cron job Finished");

    } catch (e: any) {
      console.error("❌ Cron job error:", e.message);
    }
  });
};
