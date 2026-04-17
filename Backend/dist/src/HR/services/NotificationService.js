import { prisma } from "../Lib/prisma.js";
let ioInstance;
export const setIoInstance = (io) => {
    ioInstance = io;
};
export const createNotification = async (hrId, title, message, type, silent = false) => {
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
                silent,
            });
        }
        return notification;
    }
    catch (error) {
        console.error("Error creating notification:", error);
    }
};
