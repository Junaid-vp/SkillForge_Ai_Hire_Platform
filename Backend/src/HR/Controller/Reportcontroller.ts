import { logger } from "../../System/utils/logger.js";
// src/HR/Controller/ReportController.ts
import { Request, Response } from "express"
import { prisma } from "../Lib/prisma.js"
import { sendReportEmailService } from "../services/Email/SendReportEmail.js"

// ── GET all interviews for Report page ───────────────────────────────────────
export const getReportInterviews = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId
    if (!hrId) return res.status(401).json({ Message: "Unauthorized" })

    const interviews = await prisma.interview.findMany({
      where: {
        hrId,
        status: { in: ["COMPLETED", "CANCELLED", "SUSPENDED"] }
      },
      include: {
        developer: {
          select: {
            id:            true,
            developerName: true,
            developerEmail: true,
            position:      true,
            experience:    true,
            skills:        true,
            aiSummary:     true,
          }
        },
        task: {
          select: {
            status:    true,
            aiScore:   true,
            aiReport:  true,
            submittedAt: true,
          }
        },
        _count: {
          select: { answers: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.status(200).json({ data: interviews, status: "success" })
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message })
  }
}

// ── GET full interview data for PDF generation ────────────────────────────────
export const getInterviewReportData = async (req: Request, res: Response) => {
  try {
    const hrId       = req.userId
    const { id }     = req.params
    if (!hrId) return res.status(401).json({ Message: "Unauthorized" })
    if(!id){
        return res.status(400).json({ Message: "Id Required" })
    }
    const interview = await prisma.interview.findUnique({
      where: { id: id as string } ,
      include: {
        developer: true,
        hr: {
          select: { name: true, companyName: true, email: true, companyWebsite: true }
        },
        answers: {
          include: {
            question: {
              select: { questionText: true, difficulty: true, orderIndex: true }
            }
          },
          orderBy: { submittedAt: "asc" }
        },
        codeAnswers: {
          include: {
            question: { select: { questionText: true } }
          }
        },
        note: { select: { content: true } },
        task: {
          include: {
            taskLibrary: {
              select: { title: true, description: true, techStack: true, category: true }
            }
          }
        }
      }
    })

    if (!interview) return res.status(404).json({ Message: "Interview not found" })
    if (interview.hrId !== hrId) return res.status(403).json({ Message: "Unauthorized" })

    res.status(200).json({ data: interview, status: "success" })
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message })
  }
}

// ── POST send email (with optional base64 PDF attachment) ─────────────────────
export const sendReportEmail = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId
    if (!hrId) return res.status(401).json({ Message: "Unauthorized" })

    const {
      to,          // developer email
      subject,     // auto filled by frontend
      message,     // HR's custom message
      pdfBase64,   // optional — base64 encoded PDF
      pdfFileName, // e.g. "Mohammed_Junaid_Report.pdf"
      interviewId,
    } = req.body

    if (!to || !subject || !message) {
      return res.status(400).json({ Message: "to, subject, and message are required" })
    }

    // Verify HR owns this interview
    if (interviewId) {
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        select: { hrId: true }
      })
      if (!interview || interview.hrId !== hrId) {
        return res.status(403).json({ Message: "Unauthorized" })
      }
    }

    // Get HR info for context
    const hr = await prisma.hR.findUnique({
      where: { id: hrId },
      select: { name: true, email: true, companyName: true }
    })

    // Delegate to service
    await sendReportEmailService({
      to,
      subject,
      message,
      pdfBase64,
      pdfFileName,
      hrName: hr?.name,
      hrCompanyName: hr?.companyName,
      hrEmail: hr?.email
    });

    // Mark as sent in DB
    if (interviewId) {
      await prisma.interview.update({
        where: { id: interviewId },
        data: { reportSent: true }
      });
    }

    res.status(200).json({ Message: "Email sent successfully", status: "success" })
  } catch (e: any) {
    logger.error({ err: e }, "[REPORT_EMAIL_ERROR]");
    res.status(500).json({ 
      Message: "Failed to send email", 
      Error: e.message,
      Stack: e.stack
    })
  }
}