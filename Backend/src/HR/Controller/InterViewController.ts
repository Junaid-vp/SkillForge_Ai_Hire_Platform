import { Request, Response } from "express";
import { DeveloperDetails } from "../Lib/type.js";
import { prisma } from "../Lib/prisma.js";
import { UniqueCodeGenerator } from "../services/uniqueCodeGenerator.js";
import { redis } from "../Lib/redis.js";
import { sendUniqueCode } from "../services/Email/SendUniqueCodeEmail.js";
import { sendResheduledTime } from "../services/Email/sendReshedule.js";
import { createNotification } from "../services/NotificationService.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


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

    await createNotification(
      id,
      "Interview Scheduled",
      `${developerName} interview is scheduled for ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}.`,
      "INTERVIEW_SCHEDULED",
      
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
    },
    hr: {
      select: {
        name: true
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

    await createNotification(
      id,
      "Interview Rescheduled",
      `${interview.developer.developerName} interview moved to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
      "INTERVIEW_RESCHEDULED",
      
    );

    res.status(200).json({
      message: "Interview rescheduled successfully",
      status: "success"
    });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "HR is not logged in" });
    }

    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ Message: "interviewId is required" });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      return res.status(404).json({ Message: "Interview not found" });
    }

    if (interview.hrId !== id) {
      return res.status(403).json({ Message: "Unauthorized" });
    }

    if (interview.status === "COMPLETED") {
      return res.status(400).json({ Message: "Cannot cancel a completed interview" });
    }

    if (interview.status === "CANCELLED") {
      return res.status(400).json({ Message: "Interview is already cancelled" });
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "CANCELLED" }
    });

    const developer = await prisma.developer.findUnique({
      where: { id: interview.developerId },
      select: { developerName: true },
    });

    await createNotification(
      id,
      "Interview Cancelled",
      `Interview with ${developer?.developerName ?? "developer"} has been cancelled.`,
      "INTERVIEW_CANCELLED",
      
    );

    res.status(200).json({
      message: "Interview cancelled successfully",
      status: "success"
    });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

// ── Generate AI Interview Feedback ──────────────────────────────────────────

export const generateInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId;
    if (!hrId) return res.status(401).json({ Message: "HR is not logged in" });

    const { interviewId } = req.body;
    if (!interviewId) return res.status(400).json({ Message: "interviewId is required" });

    // Fetch all interview data in one query
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        developer: true,
        hr: { select: { name: true, companyName: true } },
        answers: {
          include: { question: { select: { questionText: true, expectedAnswer: true, difficulty: true } } }
        },
        codeAnswers: {
          include: { question: { select: { questionText: true } } }
        },
        note: true,
        task: {
          include: { taskLibrary: { select: { title: true, description: true, techStack: true } } }
        },
      },
    });

    if (!interview) return res.status(404).json({ Message: "Interview not found" });
    if (interview.hrId !== hrId) return res.status(403).json({ Message: "Unauthorized" });
    if (interview.status !== "COMPLETED") return res.status(400).json({ Message: "Interview must be COMPLETED to generate feedback" });

    // ── Task Persistence Check ─────────────────────────────────────────────
    if (!interview.task) {
      return res.status(400).json({ 
        Message: "Cannot generate feedback. Please assign a task to the developer first and wait for its evaluation." 
      });
    }

    const taskStatus = interview.task.status;
    if (taskStatus !== "EVALUATED" && taskStatus !== "EXPIRED") {
      return res.status(400).json({ 
        Message: `Cannot generate feedback yet. Task is currently ${taskStatus}. Please wait for it to be EVALUATED or EXPIRED.` 
      });
    }

    // ── Build prompt sections ──────────────────────────────────────────────

    const devName = interview.developer.developerName;
    const position = interview.developer.position;
    const experience = interview.developer.experience;

    // Q&A section
    const qaSection = interview.answers.length > 0
      ? interview.answers.map((a, i) =>
          `Q${i + 1} [${a.question.difficulty}]: ${a.question.questionText}\n` +
          `Expected: ${a.question.expectedAnswer}\n` +
          `Developer Answer: ${a.answerText}\n` +
          `Score: ${a.score ?? "N/A"}/10 | AI Feedback: ${a.feedback ?? "N/A"}`
        ).join("\n\n")
      : "No Q&A answers recorded.";

    // Code section
    const codeSection = interview.codeAnswers.length > 0
      ? interview.codeAnswers.map((c, i) =>
          `Problem ${i + 1}: ${c.question.questionText}\n` +
          `Language: ${c.language}\n` +
          `Code:\n${c.code}\n` +
          `Output: ${c.output ?? "N/A"} | Status: ${c.codeStatus ?? "N/A"}`
        ).join("\n\n")
      : "No code submissions recorded.";

    // HR Notes
    const hrNotes = interview.note?.content || "No HR notes recorded.";

    // Task evaluation
    const taskSection = interview.task
      ? `Task: ${interview.task.taskLibrary.title} (${interview.task.taskLibrary.techStack})\n` +
        `Description: ${interview.task.taskLibrary.description}\n` +
        `AI Score: ${interview.task.aiScore ?? "N/A"}/100\n` +
        `AI Report: ${JSON.stringify(interview.task.aiReport ?? {})}`
      : "No task assigned.";

    const prompt = `You are an expert technical interviewer generating a comprehensive candidate feedback report.

Candidate: ${devName}
Position: ${position}
Experience: ${experience} years
Company: ${interview.hr.companyName}
Interviewer: ${interview.hr.name}

=== Q&A TECHNICAL ANSWERS ===
${qaSection}

=== CODE SUBMISSIONS ===
${codeSection}

=== HR INTERVIEW NOTES ===
${hrNotes}

=== TASK EVALUATION ===
${taskSection}

Based on ALL the above data, generate a comprehensive interview feedback report as a VALID JSON object with EXACTLY this structure (no markdown, no extra text, just raw JSON):
{
  "overallScore": <number 1-10>,
  "recommendation": "<HIRE|MAYBE|NO_HIRE>",
  "summary": "<2-3 sentence executive summary>",
  "technicalScore": <number 1-10>,
  "communicationScore": <number 1-10>,
  "codeQualityScore": <number 1-10>,
  "taskScore": <number 1-10>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "qaAnalysis": "<detailed analysis of Q&A performance>",
  "codeAnalysis": "<detailed analysis of code quality and problem solving>",
  "taskAnalysis": "<analysis of the take-home task>",
  "hrNotesSummary": "<key observations from HR notes>",
  "hiringRationale": "<clear explanation of why this recommendation was made>"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Extract JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ Message: "AI returned invalid response" });
    const feedback = JSON.parse(jsonMatch[0]);

    // Save to DB
    await prisma.interview.update({
      where: { id: interviewId },
      data: { feedback, feedbackGeneratedAt: new Date() },
    });

    res.status(200).json({ feedback, status: "success" });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

// ── Get Interview Feedback ───────────────────────────────────────────────────

export const getInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId;
    if (!hrId) return res.status(401).json({ Message: "HR is not logged in" });

    const interviewId = req.params.interviewId as string;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { hrId: true, feedback: true, feedbackGeneratedAt: true, status: true },
    });

    if (!interview) return res.status(404).json({ Message: "Interview not found" });
    if (interview.hrId !== hrId) return res.status(403).json({ Message: "Unauthorized" });

    res.status(200).json({
      feedback: interview.feedback ?? null,
      feedbackGeneratedAt: interview.feedbackGeneratedAt ?? null,
      status: "success",
    });

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};
