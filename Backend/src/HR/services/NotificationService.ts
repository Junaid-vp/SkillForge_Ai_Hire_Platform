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
        message,
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
    console.error("Error creating notification:", error);
  }
};
