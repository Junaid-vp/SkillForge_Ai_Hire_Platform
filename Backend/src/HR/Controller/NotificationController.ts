import { Request, Response } from "express";
import { prisma } from "../Lib/prisma.js";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId
    const notifications = await prisma.notification.findMany({
      where: { hrId: hrId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ data: notifications });
  } catch (error: any) {
    res.status(500).json({ Message: "Failed to fetch notifications", Error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId;
    if (!hrId) return res.status(401).json({ Message: "Unauthorized" });
    const { id } = req.params;
    const result = await prisma.notification.updateMany({
      where: { id: id as string, hrId },
      data: { isRead: true },
    });
    if (result.count === 0) {
      return res.status(404).json({ Message: "Notification not found" });
    }
    res.status(200).json({ Message: "Notification marked as read" });
  } catch (error: any) {
    res.status(500).json({ Message: "Failed to update notification", Error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { hrId: req.userId, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ Message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ Message: "Failed to update notifications", Error: error.message });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId;
    if (!hrId) return res.status(401).json({ Message: "Unauthorized" });
    const { id } = req.params;
    const result = await prisma.notification.deleteMany({
      where: { id: id as string, hrId },
    });
    if (result.count === 0) {
      return res.status(404).json({ Message: "Notification not found" });
    }
    res.status(200).json({ Message: "Notification deleted" });
  } catch (error: any) {
    res.status(500).json({ Message: "Failed to delete notification", Error: error.message });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { hrId: req.userId },
    });
    res.status(200).json({ Message: "All notifications cleared" });
  } catch (error: any) {
    res.status(500).json({ Message: "Failed to clear notifications", Error: error.message });
  }
};
