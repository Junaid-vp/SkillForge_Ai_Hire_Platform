import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../Lib/prisma.js";
import { generateOTP } from "../services/generateOTP.js";
import { sentOTPemail } from "../services/SentToemail/sendEmailOTP.js";
import { tokenGenerator } from "../services/tokenGeneratior.js";
import { HrDetails } from "../Lib/type.js";
import { redis } from "../Lib/redis.js";

export const HRregisterController = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      companyName,
      designation,
      companyWebsite,
      password,
    }: HrDetails = req.body;

    const existingHr = await prisma.hR.findUnique({
      where: { email },
    });

    if (existingHr) {
      res.status(400).json({ message: "HR already exists" });
      return;
    }

    const hashPassword: string = await bcrypt.hash(password, 10);

    await prisma.hR.create({
      data: {
        name,
        email,
        companyName,
        designation,
        companyWebsite,
        password: hashPassword,
      },
    });

    res
      .status(201)
      .json({ message: "Registration successful", status: "success" });
  } catch (e) {
    res.status(500).json({
      message: "Server error",
      e,
    });
  }
};

export const HrloginController = async (req: Request, res: Response) => {
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

    const isValid: boolean = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(400).json({ Message: "Invalid Password" });
    }

    const otp : string = generateOTP();

    await sentOTPemail(email, otp);

    await redis.set(`otp:${email}`, otp, {
      EX: 300,
    });

    res.json({
      Message: "Otp Sent To Email",
      Status: "Success",
    });
  } catch (e: any) {
    res.json({
      Message: "Server Error",
      Error: e.message,
    });
  }
};

export const otpValidation = async (req: Request, res: Response) => {
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
      .cookie("Access_Token", AccessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .cookie("Refresh_Token", RefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        Message: "Login Successful",
        Status: "Success",
      });
  } catch (e: any) {
    res.status(500).json({
      Message: "Server Error",
      Error: e.message,
    });
  }
};

export const otpResend = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await redis.del(`otp:${email}`)
    const otp: string = generateOTP();
    await sentOTPemail(email, otp);
    await redis.set(`otp:${email}`, otp, {
      EX: 300,
    });
    
    res.json({
      Message: "Otp Sent To Email",
      Status: "Success",
    });
  } catch (e: any) {
    console.log(e.message);
  }
};

 export const HrLogoutController = async (req: Request, res:Response) => {
  try {
    res
      .clearCookie("Access_Token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .clearCookie("Refresh_Token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .status(200)
      .json({ Message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ Message: "Logout error" });
  }
};