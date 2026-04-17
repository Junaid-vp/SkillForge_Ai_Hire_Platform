import express from "express";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, } from "../Controller/NotificationController.js";
import isHr from "../Middleware/isHr.js";
const router = express.Router();
router.get("/", isHr, getNotifications);
router.patch("/:id/mark-read", isHr, markAsRead);
router.patch("/mark-all-read", isHr, markAllAsRead);
router.delete("/delete/:id", isHr, deleteNotification); // Still delete/:id
router.delete("/clear-all", isHr, clearAllNotifications);
export default router;
