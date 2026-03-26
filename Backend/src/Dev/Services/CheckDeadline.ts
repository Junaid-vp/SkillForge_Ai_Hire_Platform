// import { CronJob } from "cron";
import cron from "node-cron";
import { prisma } from "../../HR/Lib/prisma.js";
export const CheckTaskDeadLine = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();

      const res = await prisma.task.updateMany({
        where: {
          deadline: { lt: now },
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      });

      console.log(`${res.count}`, "Task Expired");
    } catch (e: any) {
      console.log(e.message);
    }
  });
};
