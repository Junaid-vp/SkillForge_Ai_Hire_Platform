import { logger } from "../../System/utils/logger.js";
import bcrypt from "bcryptjs";
import { prisma } from "../Lib/prisma.js";
import { generateOTP } from "../services/generateOTP.js";
import { sentOTPemail } from "../services/Email/sendEmailOTP.js";
import { tokenGenerator } from "../services/tokenGeneratior.js";
import { redis } from "../Lib/redis.js";
import { authCookieOptions } from "../Lib/cookieOptions.js";
export const HRregisterController = async (req, res) => {
    try {
        const { name, email, companyName, designation, companyWebsite, password, } = req.body;
        const existingHr = await prisma.hR.findUnique({
            where: { email },
        });
        if (existingHr) {
            res.status(400).json({ message: "HR already exists" });
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        await prisma.hR.create({
            data: {
                name,
                email,
                companyName,
                designation,
                companyWebsite,
                password: hashPassword,
                interviewLimit: 5
            },
        });
        res
            .status(201)
            .json({ message: "Registration successful", status: "success" });
    }
    catch (e) {
        res.status(500).json({
            message: "Server error",
            e,
        });
    }
};
export const HrloginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.hR.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res
                .status(400)
                .json({ Message: "Account Not Found, Check Email And Password" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ Message: "Invalid Password" });
        }
        const otp = generateOTP();
        await sentOTPemail(email, otp);
        await redis.set(`otp:${email}`, otp, {
            EX: 300,
        });
        res.json({
            Message: "Otp Sent To Email",
            Status: "Success",
        });
    }
    catch (e) {
        res.json({
            Message: "Server Error",
            Error: e.message,
        });
    }
};
export const otpValidation = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const userOtp = await redis.get(`otp:${email}`);
        if (!userOtp) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }
        if (otp !== userOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        await redis.del(`otp:${email}`);
        const user = await prisma.hR.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { RefreshToken, AccessToken } = tokenGenerator(email, user.id);
        res
            .status(200)
            .cookie("Access_Token", AccessToken, authCookieOptions)
            .cookie("Refresh_Token", RefreshToken, authCookieOptions)
            .json({
            Message: "Login Successful",
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
export const otpResend = async (req, res) => {
    try {
        const { email } = req.body;
        await redis.del(`otp:${email}`);
        const otp = generateOTP();
        await sentOTPemail(email, otp);
        await redis.set(`otp:${email}`, otp, {
            EX: 300,
        });
        res.json({
            Message: "Otp Sent To Email",
            Status: "Success",
        });
    }
    catch (e) {
        logger.info(e.message);
    }
};
export const HrLogoutController = async (req, res) => {
    try {
        res
            .clearCookie("Access_Token", authCookieOptions)
            .clearCookie("Refresh_Token", authCookieOptions)
            .status(200)
            .json({ Message: "Logout successful" });
    }
    catch (e) {
        res.status(500).json({ Message: "Logout error" });
    }
};
export const getHrMeController = async (req, res) => {
    try {
        const hrId = req.userId;
        const user = await prisma.hR.findUnique({
            where: { id: hrId },
            select: {
                id: true,
                plan: true,
                name: true,
                email: true,
                companyName: true,
                designation: true,
                companyWebsite: true,
                interviewCount: true,
                interviewLimit: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ data: user });
    }
    catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
};
