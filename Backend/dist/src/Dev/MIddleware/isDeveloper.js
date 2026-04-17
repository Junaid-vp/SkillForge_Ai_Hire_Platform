import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../../HR/Lib/prisma.js";
dotenv.config();
export const isDeveloper = async (req, res, next) => {
    try {
        const token = req.cookies?.Dev_Access_Token;
        if (!token) {
            return res.status(401).json({ Message: "Unauthorized" });
        }
        const accessKey = process.env.ACCESS_TOKEN_KEY;
        if (!accessKey)
            throw new Error("JWT key not defined");
        const decode = jwt.verify(token, accessKey);
        const interview = await prisma.interview.findFirst({
            where: { developerId: decode.Id }
        });
        if (!interview) {
            return res.status(400).json({ Message: "No interview found" });
        }
        const task = await prisma.task.findFirst({
            where: { developerId: decode.Id }
        });
        req.devId = decode.Id;
        if (!task) {
            return next();
        }
        if (interview.status === "CANCELLED") {
            return res.status(403).json({
                Message: "Interview cancelled"
            });
        }
        if (interview.status === "COMPLETED") {
            if (task && task.status === "PENDING") {
                return next();
            }
            if (task?.status === "SUBMITTED") {
                return res.status(403).json({
                    Message: "Task already submitted"
                });
            }
            if (task?.status === "EXPIRED") {
                return res.status(403).json({
                    Message: "Task deadline passed"
                });
            }
            return res.status(403).json({
                Message: "Interview completed. No task assigned yet.",
            });
        }
        next();
    }
    catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                Message: "Access token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        if (e instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                Message: "Invalid token",
                code: "INVALID_TOKEN"
            });
        }
        res.status(500).json({
            Message: "Server Error",
            Error: e.message
        });
    }
};
// SCHEDULED/STARTED interview
