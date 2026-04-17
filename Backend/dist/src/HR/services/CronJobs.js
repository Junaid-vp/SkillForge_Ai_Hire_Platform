import { CronJob } from "cron";
import { prisma } from "../Lib/prisma.js";
import { redis } from "../Lib/redis.js";
import { sendInterviewReminderEmail, sendDeveloperReminderEmail } from "./Email/ReminderEmail.js";
import { createNotification } from "./NotificationService.js";
export const startCronJobs = () => {
    console.log("🚀 Initializing Cron Jobs...");
    // ── Existing: Expire tasks every hour ────────────────────────────────────
    // 0 * * * * = at the start of every hour
    const taskExpiryJob = new CronJob("0 * * * *", async () => {
        try {
            console.log("🕒 Running Task Expiry Cron Job...");
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
                await createNotification(task.hrId, "Task Expired", `The task deadline for ${task.developer.developerName} has passed without submission.`, "TASK_EXPIRED");
            }
            console.log(`✅ Expired ${expiredTasks.length} tasks.`);
        }
        catch (e) {
            console.error("❌ Task Expiry Cron error:", e.message);
        }
    });
    // ── NEW: Interview reminders every minute ─────────────────────────────────
    // * * * * * = every minute
    const interviewReminderJob = new CronJob("* * * * *", async () => {
        try {
            const now = new Date();
            const targetTime = new Date(now.getTime() + 10 * 60 * 1000); // Target: exactly 10 minutes from now
            const label = "10 minutes";
            const windowStart = new Date(targetTime.getTime() - 1 * 60 * 1000); // 9 mins from now
            const windowEnd = new Date(targetTime.getTime() + 1 * 60 * 1000); // 11 mins from now
            const interviews = await prisma.interview.findMany({
                where: {
                    status: "SCHEDULED",
                    scheduledAt: {
                        gte: windowStart,
                        lte: windowEnd,
                    },
                    reminder10Sent: false, // Only if this reminder hasn't been sent
                },
                include: {
                    hr: true,
                    developer: true,
                },
            });
            for (const interview of interviews) {
                // 1. Create bell notification for HR
                await createNotification(interview.hrId, `Interview in ${label}`, `Your interview with ${interview.developer.developerName} starts in ${label}`, "INTERVIEW_REMINDER");
                // 2. Send email to HR
                await sendInterviewReminderEmail({
                    to: interview.hr.email,
                    hrName: interview.hr.name,
                    developerName: interview.developer.developerName,
                    intervalLabel: label,
                    interviewId: interview.id,
                    startTime: interview.developer.interviewTime,
                });
                // 3. Send email to Developer
                await sendDeveloperReminderEmail({
                    to: interview.developer.developerEmail,
                    developerName: interview.developer.developerName,
                    hrName: interview.hr.name,
                    companyName: interview.hr.companyName,
                    intervalLabel: label,
                    interviewId: interview.id,
                    startTime: interview.developer.interviewTime,
                });
                // 4. Update flag to prevent duplicate sends
                await prisma.interview.update({
                    where: { id: interview.id },
                    data: { reminder10Sent: true },
                });
                console.log(`📅 ${label} reminder sent for interview ${interview.id}`);
            }
        }
        catch (e) {
            console.error("❌ Interview reminder cron error:", e.message);
        }
    });
    taskExpiryJob.start();
    interviewReminderJob.start();
    console.log("✅ All cron jobs started");
};
