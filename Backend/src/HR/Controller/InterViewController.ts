import { Request, Response } from "express";
import { DeveloperDetails } from "../Lib/type.js";
import { prisma } from "../Lib/prisma.js";
import { UniqueCodeGenerator } from "../services/uniqueCodeGenerator.js";
import { redis } from "../Lib/redis.js";
import { sendUniqueCode } from "../services/Email/SendUniqueCodeEmail.js";
import { sendResheduledTime } from "../services/Email/sendReshedule.js";


export const generateUniqueCode = async (req: Request, res: Response) => {
  try {
    const id: string | undefined = req.userId;

    if (!id) {
      return res.status(401).json({
        Message: "Hr is Not Logged",
      });
    }

    const uniqueCode: string = UniqueCodeGenerator();

    await redis.set(`Unique:${uniqueCode}`, uniqueCode, {
      EX: 600,
    });

    res.status(201).json({
      Code: uniqueCode,
      Status: "Success",
    });
  } catch (e: any) {
    res.status(500).json({
      Message: "Server Error",
      Error: e.message,
    });
  }
};

export const sheduleInterview = async (req: Request, res: Response) => {
  try {
    const id: string | undefined = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR is not logged in" });
    }


    const user = await prisma.hR.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ Message: "HR not found" });
    }


    if (user.plan === "free" && user.interviewCount >= user.interviewLimit) {
      return res.status(403).json({
        Message: "Interview limit reached. Please upgrade to Pro.",
        upgrade: true,
      });
    }

    const {
      developerEmail,
      developerName,
      experience,
      interviewDate,
      interviewTime,
      position,
      uniqueCode,
      resumeUrl,
      aiSummary,
      skills,

    }: DeveloperDetails = req.body;

    const Code = await redis.get(`Unique:${uniqueCode}`);

    if (Code !== uniqueCode) {
      return res.status(400).json({ Message: "Invalid uniqueCode" });
    }
      
       

    await redis.del(`Unique:${uniqueCode}`);

    const dev = await prisma.developer.create({
      data: {
        developerName,
        hrId: id,
        developerEmail,
        position,
        experience: typeof experience === "string"
          ? parseInt(experience)
          : experience,
        interviewDate: new Date(interviewDate),
        interviewTime,
        uniqueCode,
        resumeUrl:  resumeUrl  ?? null,  
        aiSummary:  aiSummary  ?? null,  
        skills:     skills  ? JSON.stringify(skills) : null,                   
      },
    });

    const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00`);

  await prisma.interview.create({
      data: {
        hrId: id,
        developerId: dev.id,
        scheduledAt,
      },
    });

  await prisma.hR.update({
      where: { id },
      data: { interviewCount: { increment: 1 } },
    });



  const magicLink = `${process.env.FRONTEND_URL}/devLogin?token=${uniqueCode}`;

  const today = new Date()
  const secondsUntilExpired = Math.floor((scheduledAt.getTime() - today.getTime()) / 1000) + 604800;

  await redis.set(`magic:${uniqueCode}`,dev.id,{ EX: secondsUntilExpired });


  await sendUniqueCode(
      developerName, developerEmail, position,
      uniqueCode, interviewDate, interviewTime,
      user.email, user.companyName, user.name,magicLink
    );

    res.status(201).json({
      message: "Interview scheduled successfully",
      status: "success"
    });

  } catch (e: any) {
    res.status(500).json({ Error: e.message, Message: "Server Error" });
  }
};


export const sheduledInterviewDetails = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR is not logged in" });
    }

    const details = await prisma.interview.findMany({
      where: { hrId: id },
      include: {
        developer: {
          select: {
            id: true,
            developerName: true,
            developerEmail: true,
            position: true,
            experience: true,
            interviewDate: true,
            interviewTime: true,
            uniqueCode: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });


    if (details.length === 0) {
      return res.status(200).json({
        data: [],
        status: "success"
      });
    }

    res.status(200).json({
      data: details,
      status: "success"
    });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const getDevelopers = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR is not logged in" });
    }

    const developers = await prisma.developer.findMany({
      where: { hrId: id },
      orderBy: { createdAt: "desc" }
    });


    if (developers.length === 0) {
      return res.status(200).json({
        data: [],
        status: "success"
      });
    }

    res.status(200).json({
      data: developers,
      status: "success"
    });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const rescheduleInterview = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR is not logged in" });
    }

    const { interviewId, newDate, newTime } = req.body;

    if (!interviewId || !newDate || !newTime) {
      return res.status(400).json({ Message: "interviewId, newDate and newTime are required" });
    }


    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { developer: true, hr: true }
    });

    if (!interview) {
      return res.status(404).json({ Message: "Interview not found" });
    }


    if (interview.hrId !== id) {
      return res.status(403).json({ Message: "Unauthorized" });
    }

    const scheduledAt = new Date(`${newDate}T${newTime}:00`);
    const now = new Date();

    if (scheduledAt <= now) {
      return res.status(400).json({
        Message: "Cannot schedule interview in the past"
      });
    }


    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt,
        status: "SCHEDULED"
      }
    });


    await prisma.developer.update({
      where: { id: interview.developerId },
      data: {
        interviewDate: new Date(newDate),
        interviewTime: newTime,
      }
    });


  const magicLink = `${process.env.FRONTEND_URL}/devLogin?token=${interview.developer.uniqueCode}`;

  const today = new Date()
  const secondsUntilExpired = Math.floor((scheduledAt.getTime() - today.getTime()) / 1000) + 604800;

  await redis.set(`magic:${interview.developer.uniqueCode}`,interview.developerId,{ EX: secondsUntilExpired });


    await sendResheduledTime(
      interview.developer.developerName,
      interview.developer.developerEmail,
      interview.developer.position,
      interview.developer.uniqueCode,
      interview.hr.email,
      interview.hr.companyName,
      interview.hr.name,
      newTime,
      newDate,
      magicLink
    )

    res.status(200).json({
      message: "Interview rescheduled successfully",
      status: "success"
    });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};
