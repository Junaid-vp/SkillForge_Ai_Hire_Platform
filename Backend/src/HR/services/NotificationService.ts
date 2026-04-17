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
 
) => {
  try {
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
       
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
