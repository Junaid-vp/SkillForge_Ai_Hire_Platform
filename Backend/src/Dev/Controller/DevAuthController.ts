import { Request, Response } from "express";
import { prisma } from "../../HR/Lib/prisma.js";
import { otpGenerate } from "../Services/OtpGenerator.js";
import { sentOTPtoDev } from "../Services/Email/OtpSendToEmail.js";
import { redis } from "../../HR/Lib/redis.js";
import { tokenGeneratorDev } from "../Services/TokenGenerator.js";

export const DevLoginController = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        Message: "Email and Code are required"
      });
    }

const Dev = await prisma.developer.findUnique({
  where: { uniqueCode: code }
});

if (!Dev) {
  return res.status(400).json({
    Message: "Invalid invite code"
  });
}



if (Dev.developerEmail !== email) {
  return res.status(400).json({
    Message: "Email does not match this code"
  });
}


    const interview = await prisma.interview.findFirst({
      where: { developerId: Dev.id }
    })

    if (!interview) {
      return res.status(400).json({ Message: "No interview found" })
    }


    if (interview.status === "CANCELLED") {
      return res.status(403).json({ Message: "Interview cancelled" })
    }

    if (interview.status === "COMPLETED") {
      const task = await prisma.task.findFirst({
        where: { developerId: Dev.id }
      })

      if (!task) {
        return res.status(403).json({
          Message: "Interview completed. Waiting for task assignment.",
          waitingForTask: true
        })
      }

      if (task.status === "SUBMITTED") {
        return res.status(403).json({
          Message: "Your task has already been submitted"
        })
      }

      if (task.status === "EXPIRED") {
        return res.status(403).json({
          Message: "Your task deadline has passed"
        })
      }


    }


    await redis.del(`otp:${email}`)
    const otp = otpGenerate();
    await sentOTPtoDev(email, otp);
    await redis.set(`otp:${email}`, otp, { EX: 300 });

    res.status(200).json({
      Message: "OTP sent to email",
      Status: "Success"
    });

  } catch (e: any) {
    res.status(500).json({
      Message: "Server Error",
      Error: e.message
    });
  }
};

export const otpValidationDev = async (req: Request, res: Response) => {
  try {
    const { email, otp, uniqueCode } = req.body
    const devotp = await redis.get(`otp:${email}`)

    if (!devotp) {
      return res.status(400).json({ Message: "OTP expired or not found" })
    }

    if (devotp !== otp) {
      return res.status(400).json({ Message: "Invalid OTP" })
    }

    await redis.del(`otp:${email}`)


    const Dev = await prisma.developer.findFirst({
      where: {
        developerEmail: email,
        uniqueCode: uniqueCode
      }
    })

    if (!Dev) {
      return res.status(404).json({ Message: "Developer not found" })
    }

    const { AccessToken } = tokenGeneratorDev(email, Dev.id)
    res
      .status(200)
      .cookie("Dev_Access_Token", AccessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      }).json({
        Message: "Login Successful",
        Status: "Success"
      })

  } catch (e: any) {
    res.status(500).json({
      Message: "Server Error",
      Error: e.message
    })
  }
}

export const DevOtpResend = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ Message: "Email required" })
    }

    await redis.del(`otp:${email}`)

    const otp = otpGenerate();
    
    await sentOTPtoDev(email, otp);

    await redis.set(`otp:${email}`, otp, { EX: 300 });

    res.status(200).json({
      Message: "OTP Re-sent to email",
      Status: "Success"
    });

  } catch (e: any) {

    res.status(500).json({
      Message: "Server Error",
      Error: e.message
    });
  }
};



export const DevLogoutController = async (req: Request, res: Response) => {
  try {
    res
      .clearCookie("Dev_Access_Token", {
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

export const MaginLinkVarification = async(req:Request,res:Response)=>{
  try{
  const {token} = req.body
  
  const developerId = await redis.get(`magic:${token}`)
if (!developerId) {
      return res.status(400).json({
        Message: "Invalid or expired link. Please contact HR."
      });
    }

    const developer = await prisma.developer.findUnique({
      where: { id: developerId }
    });

    if (!developer) {
      return res.status(404).json({ Message: "Developer not found" });
    }

  
    const interview = await prisma.interview.findFirst({
      where: { developerId: developer.id }
    });

    if (interview?.status === "CANCELLED") {
      return res.status(403).json({ Message: "Interview cancelled" });
    }


    const task = await prisma.task.findFirst({
      where: { developerId: developer.id }
    });

    if (task?.status === "SUBMITTED") {
      return res.status(403).json({ Message: "Task already submitted" });
    }

    if (task?.status === "EXPIRED") {
      return res.status(403).json({ Message: "Task deadline passed" });
    }

   
    const { AccessToken } = tokenGeneratorDev(
      developer.developerEmail,
      developer.id
    );

    res
      .status(200)
      .cookie("Dev_Access_Token", AccessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        Message: "Login successful",
        Status: "success"
      });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};