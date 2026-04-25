import { logger } from "../../System/utils/logger.js";
import cron from "node-cron";
import { prisma } from "../../HR/Lib/prisma.js";
import { redis } from "../../HR/Lib/redis.js";

export const CheckTaskDeadLine = () => {
  logger.info("✅ Cron job started");

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

       logger.info(" Cron job Finished");

    } catch (e: any) {
      logger.error("❌ Cron job error:", e.message);
    }
  });
};
