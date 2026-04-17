import { prisma } from "../Lib/prisma.js";
export const getNotifications = async (req, res) => {
    try {
        const hrId = req.userId;
        const notifications = await prisma.notification.findMany({
            where: { hrId: hrId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ data: notifications });
    }
    catch (error) {
        res.status(500).json({ Message: "Failed to fetch notifications", Error: error.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id: id },
            data: { isRead: true },
        });
        res.status(200).json({ Message: "Notification marked as read" });
    }
    catch (error) {
        res.status(500).json({ Message: "Failed to update notification", Error: error.message });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { hrId: req.userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ Message: "All notifications marked as read" });
    }
    catch (error) {
        res.status(500).json({ Message: "Failed to update notifications", Error: error.message });
    }
};
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.delete({
            where: { id: id },
        });
        res.status(200).json({ Message: "Notification deleted" });
    }
    catch (error) {
        res.status(500).json({ Message: "Failed to delete notification", Error: error.message });
    }
};
export const clearAllNotifications = async (req, res) => {
    try {
        await prisma.notification.deleteMany({
            where: { hrId: req.userId },
        });
        res.status(200).json({ Message: "All notifications cleared" });
    }
    catch (error) {
        res.status(500).json({ Message: "Failed to clear notifications", Error: error.message });
    }
};
