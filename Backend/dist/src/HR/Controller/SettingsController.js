import { logger } from "../../System/utils/logger.js";
import { prisma } from "../Lib/prisma.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../services/generateOTP.js";
import { redis } from "../Lib/redis.js";
import { sentChangePassOtp } from "../services/Email/SendChangePassOtp.js";
export const GetSpecificHrDetails = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        const data = await prisma.hR.findUnique({
            where: {
                id,
            }, select: {
                createdAt: true,
                name: true,
                email: true,
                companyName: true,
                designation: true,
                companyWebsite: true,
                plan: true,
                interviewCount: true,
                interviewLimit: true,
                subscription: {
                    select: {
                        status: true,
                    }
                },
                notifInterviews: true,
                notifSubmissions: true,
                notifProgress: true
            },
        });
        if (!data) {
            return res.status(404).json({
                Message: "Hr Data Not Found",
            });
        }
        res.status(200).json({
            Hr: data,
        });
    }
    catch (e) {
        res.status(500).json({
            Message: "Server Error",
            Error: e.message,
        });
    }
};
export const updateHrDetails = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) {
            return res.status(400).json({
                Message: "Hr Not Logged",
            });
        }
        const { companyName, companyWebsite, name, designation } = req.body;
        if (!companyName || !companyWebsite || !name || !designation) {
            return res.status(400).json({
                Message: "Datas Required",
            });
        }
        await prisma.hR.update({
            where: {
                id,
            },
            data: {
                companyName,
                companyWebsite,
                name,
                designation,
            },
        });
        res.status(200).json({
            Message: "Updated Success Full",
            Status: "Success",
        });
    }
    catch (e) {
        res.status(500).json({
            Message: "Server Error",
            Error: e.message,
        });
    }
};
export const changePassword = async (req, res) => {
    try {
        const id = req.userId;
        const { currentPassword } = req.body;
        if (!id) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        const hr = await prisma.hR.findUnique({
            where: {
                id,
            },
        });
        if (!hr) {
            return res.status(404).json({
                Message: "HR Not Founded",
            });
        }
        const isValid = await bcrypt.compare(currentPassword, hr.password);
        if (!isValid) {
            return res.status(400).json({
                Message: "Your Current Password is Wroung",
            });
        }
        const otp = generateOTP();
        await sentChangePassOtp(hr.email, otp);
        await redis.del(`otp:${hr.email}`);
        await redis.set(`otp:${hr.email}`, otp, {
            EX: 300,
        });
        res.json({
            Message: "PassWord Change Otp Sent To Email",
            Status: "Success",
        });
    }
    catch (e) {
        res.status(500).json({
            Message: "Server Error",
            Error: e.message,
        });
    }
};
export const passwordCodeVarification = async (req, res) => {
    try {
        const id = req.userId;
        const { newPassword, otp } = req.body;
        if (!id) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        const hr = await prisma.hR.findUnique({
            where: {
                id,
            },
        });
        if (!hr) {
            return res.status(404).json({
                Message: "HR Not Founded",
            });
        }
        const OtpCode = await redis.get(`otp:${hr.email}`);
        if (OtpCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        await redis.del(`otp:${hr.email}`);
        const hashPassword = await bcrypt.hash(newPassword, 10);
        await prisma.hR.update({
            where: {
                id,
            },
            data: {
                password: hashPassword,
            },
        });
        res.status(200).json({
            Message: "Password Change SuccessFul",
            Status: "Success",
        });
    }
    catch (e) {
        res.status(500).json({
            Message: "Server Error",
            Error: e.message,
        });
    }
};
export const passCodeVarifyOtpResend = async (req, res) => {
    try {
        const id = req.userId;
        const hr = await prisma.hR.findUnique({
            where: {
                id,
            },
        });
        if (!hr) {
            return res.status(404).json({
                Message: "HR Not Founded",
            });
        }
        await redis.del(`otp:${hr.email}`);
        const otp = generateOTP();
        await sentChangePassOtp(hr.email, otp);
        await redis.set(`otp:${hr.email}`, otp, {
            EX: 300,
        });
        res.json({
            Message: "Otp ReSent To Email",
            Status: "Success",
        });
    }
    catch (e) {
        logger.info(e.message);
    }
};
export const updateNotificationSettings = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        const { notifInterviews, notifSubmissions, notifProgress } = req.body;
        await prisma.hR.update({
            where: { id },
            data: {
                notifInterviews,
                notifSubmissions,
                notifProgress,
            },
        });
        res.status(200).json({
            Message: "Notification settings updated successfully",
            Status: "Success",
        });
    }
    catch (e) {
        res.status(500).json({
            Message: "Server Error",
            Error: e.message,
        });
    }
};
