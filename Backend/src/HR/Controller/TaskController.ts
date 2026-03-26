import { Request, Response } from "express";
import { prisma } from "../Lib/prisma.js";

export const assignTask = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId;

    const { code, libaryId } = req.body;

    if (!hrId) {
      return res.status(401).json({ Message: "HR not logged in" });
    }

    if (!code) {
      return res.status(400).json({ Message: "Developer Code Required" });
    }

    if (!libaryId) {
      return res.status(400).json({ Message: "Task Library ID Required" });
    }
    
    const taskLibrary = await prisma.taskLibrary.findUnique({
      where: { id: libaryId },
    });

    if (!taskLibrary) {
      return res.status(404).json({ Message: "Task Library not found" });
    }

    const dev = await prisma.developer.findUnique({
      where: { uniqueCode: code ,hrId},
      include: {
        interviews: true,
        tasks: true,
      },
    });
    
    if (!dev) {
      return res.status(404).json({ Message: "Developer not found" });
    }

    if (dev.tasks.length > 0) {
      return res.status(400).json({ Message: "Already one task assigned" });
    }

    if (dev.interviews.length === 0) {
      return res.status(400).json({ Message: "Developer has no scheduled interview" });
    }

    const currentInterview = dev.interviews[0];
    const interviewTime = currentInterview.scheduledAt ? new Date(currentInterview.scheduledAt) : new Date();
    
    
    const deadlineDate = new Date(
  interviewTime.getTime() + taskLibrary.duration * 86400000
);
    
    await prisma.task.create({
       data: {
        interviewId: currentInterview.id, 
        hrId: hrId, 
        developerId: dev.id,
        taskLibraryId: taskLibrary.id,
        deadline: deadlineDate,
      },
    });

    await prisma.taskLibrary.update({
        where:{id:libaryId},
        data:{usedCount:{increment:1}}
    })
    
    res.status(201).json({
      Message: "Task Assigned Successfully",
      Status: "Success",
    });
  } catch (e: any) {
    console.error("Assign Task Error: ", e);
    res.status(500).json({
      Message: "Server Error",
      Error: e.message,
    });
  }
};