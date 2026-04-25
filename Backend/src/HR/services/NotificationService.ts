import { logger } from "../../System/utils/logger.js";
import { prisma } from "../Lib/prisma.js";

let ioInstance: any;

export const setIoInstance = (io: any) => {
  ioInstance = io;
};

export const createNotification = async (
  hrId: string,
  title: string,
  message: string,
  type: string,
  silent: boolean = false
) => {
  try {
    // Automatically convert any 24h format times (like "16:03") to 12h format ("4:03 PM") in the message string
    const formattedMessage = message.replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (match, h, m) => {
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${m} ${ampm}`;
    });

    // 1. Fetch HR notification preferences
    const hr = await prisma.hR.findUnique({
      where: { id: hrId },
      select: {
        notifInterviews: true,
        notifSubmissions: true,
        notifProgress: true,
      },
    });

    if (hr) {
      // 2. Check if this type of notification is enabled
      let isEnabled = true;

      if (type.startsWith("INTERVIEW_")) {
        isEnabled = hr.notifInterviews;
      } else if (type === "TASK_SUBMITTED") {
        isEnabled = hr.notifSubmissions;
      } else if (type === "TASK_EVALUATED") {
        isEnabled = hr.notifProgress;
      }

      // 3. Suppress if disabled
      if (!isEnabled) {
        return null;
      }
    }

    const notification = await prisma.notification.create({
      data: {
        hrId,
        title,
        message: formattedMessage,
        type,
      },
    });

    if (ioInstance) {
      ioInstance.to(hrId).emit("notification", {
        ...notification,
        silent,
      });
    }

    return notification;
  } catch (error) {
    logger.error("Error creating notification:", error);
  }
};
