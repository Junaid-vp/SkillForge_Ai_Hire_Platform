import { logger } from "../../System/utils/logger.js";
// ============================================
// backend/src/HR/Controller/TaskController.ts
// Uses RabbitMQ to queue AI evaluation
// ============================================

import { Request, Response }        from "express"
import { prisma }                   from "../Lib/prisma.js"
import { uploadZip }                from "../services/cloudinary.js"
import { createNotification }       from "../services/NotificationService.js"
import { enqueueTaskEvaluation } from "../services/Taskqueue.js"


// ── Assign Task ────────────────────────────────
export const assignTask = async (req: Request, res: Response) => {
  try {
    const hrId = req.userId

    const { code, libaryId } = req.body

    if (!hrId)     return res.status(401).json({ Message: "HR not logged in" })
    if (!code)     return res.status(400).json({ Message: "Developer Code Required" })
    if (!libaryId) return res.status(400).json({ Message: "Task Library ID Required" })

    const taskLibrary = await prisma.taskLibrary.findUnique({ where: { id: libaryId } })
    if (!taskLibrary) return res.status(404).json({ Message: "Task Library not found" })

    const dev = await prisma.developer.findUnique({
      where:   { uniqueCode: code, hrId },
      include: { interviews: true, tasks: true },
    })

    if (!dev)                   return res.status(404).json({ Message: "Developer not found" })
    if (dev.tasks.length > 0)   return res.status(400).json({ Message: "Already one task assigned" })
    if (!dev.interviews.length) return res.status(400).json({ Message: "Developer has no scheduled interview" })

    const interview    = dev.interviews[0]
    const interviewTime = interview.scheduledAt ? new Date(interview.scheduledAt) : new Date()
    const deadline      = new Date(interviewTime.getTime() + taskLibrary.duration * 86400000)

    await prisma.task.create({
      data: {
        interviewId:   interview.id,
        hrId,
        developerId:   dev.id,
        taskLibraryId: taskLibrary.id,
        deadline,
      },
    })

    await prisma.taskLibrary.update({
      where: { id: libaryId },
      data:  { usedCount: { increment: 1 } }
    })

    res.status(201).json({ Message: "Task Assigned Successfully", Status: "Success" })

  } catch (e: any) {
    logger.error("assignTask error:", e)
    res.status(500).json({ Message: "Server Error", Error: e.message })
  }
}

// ── Submit Task ────────────────────────────────
export const submitTask = async (req: Request, res: Response) => {
  try {
    const devId = req.devId
    if (!devId) return res.status(401).json({ Message: "Not authorized" })

    const task = await prisma.task.findFirst({
      where:   { developerId: devId },
      include: { taskLibrary: true, developer: true }
    })

    if (!task)                       return res.status(404).json({ Message: "No task found" })
    if (task.status === "SUBMITTED") return res.status(400).json({ Message: "Task already submitted" })
    if (task.status === "EXPIRED")   return res.status(400).json({ Message: "Task deadline has passed" })

    if (!req.file || !req.file.path) return res.status(400).json({ Message: "ZIP file required" })

    const filePath = req.file.path

    // Upload ZIP to Cloudinary
    const zipUrl = await uploadZip(filePath, task.id)

    // Update status → SUBMITTED immediately
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status:        "SUBMITTED",
        submissionUrl: zipUrl,
        submittedAt:   new Date(),
      }
    })

    await createNotification(
      task.hrId,
      "Task Submitted",
      `Task "${task.taskLibrary?.title ?? ""}" submitted by ${task.developer?.developerName ?? "developer"}.`,
      "TASK_SUBMITTED",
      true
    )

    // ✅ Respond immediately — developer doesn't wait for AI
    res.status(200).json({ Message: "Task submitted successfully", status: "success" })

    // ✅ Enqueue to RabbitMQ — worker picks it up and runs AI evaluation
    await enqueueTaskEvaluation({
      taskId:   task.id,
      filePath,
      task: {
        hrId:    task.hrId,
        taskLibrary: {
          title:        task.taskLibrary.title,
          description:  task.taskLibrary.description,
          requirements: task.taskLibrary.requirements ?? "",
          techStack:    task.taskLibrary.techStack,
        },
        developer: {
          developerName: task.developer?.developerName ?? "Developer",
        }
      }
    })

  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message })
  }
}




// // ── AI EVALUTION FOR FUTURE
// async function evaluateTaskWithAI(
//   taskId: string,
//   zipBuffer: Buffer,
//   task: any
// ) {
//   try {
//     // Download ZIP
//     const zip     = new AdmZip(zipBuffer)
//     const entries = zip.getEntries()
//     // Extract code files (skip node_modules, .git, images)
//     const skipFolders = [
//       "node_modules", ".git", "dist", "build", ".next",
//       "coverage", ".cache", "__pycache__", "vendor"
//     ]
//     const codeExts = [
//       ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".cpp", ".c",
//       ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt",
//       ".html", ".css", ".scss", ".json", ".md", ".env.example",
//       ".prisma", ".sql", ".yaml", ".yml"
//     ]

//     let codeContent = ""
//     let fileCount = 0

//     for (const entry of entries) {
//       if (entry.isDirectory) continue

//       const skip = skipFolders.some(f => entry.entryName.includes(f))
//       if (skip) continue

//       const ext = "." + entry.entryName.split(".").pop()?.toLowerCase()
//       if (!codeExts.includes(ext)) continue

//       // Limit file size to avoid huge prompts
//       const content = entry.getData().toString("utf8")
//       if (content.length > 5000) continue

//       codeContent += `\n\n// FILE: ${entry.entryName}\n${content}`
//       fileCount++

//       // Max 20 files
//       if (fileCount >= 20) break
//     }

//     if (!codeContent) {
//       codeContent = "No readable code files found in submission"
//     }

//     // AI evaluation
//     const response2 = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [
//         {
//           role: "system",
//           content: `You are a senior software engineer and technical hiring manager at a top-tier tech company.
// You are reviewing a code submission from a job candidate for a take-home technical task.
// You have 15+ years of experience reviewing code and you are also an expert at detecting AI-generated code vs human-written code.
// Your evaluation must be honest, specific, and evidence-based — reference actual files and code patterns you observe.
// Return ONLY valid JSON. No markdown. No explanation outside the JSON.`
//         },
//         {
//           role: "user",
//           content: `You are evaluating a take-home coding task submitted by a job candidate.

// ══════════════════════════════════════
// TASK DETAILS
// ══════════════════════════════════════
// Title:        ${task.taskLibrary.title}
// Description:  ${task.taskLibrary.description}
// Requirements: ${task.taskLibrary.requirements}
// Tech Stack:   ${task.taskLibrary.techStack}

// ══════════════════════════════════════
// SUBMITTED CODE (${fileCount} files)
// ══════════════════════════════════════
// ${codeContent}

// ══════════════════════════════════════
// YOUR JOB: EVALUATE ON TWO DIMENSIONS
// ══════════════════════════════════════

// DIMENSION 1 — TECHNICAL QUALITY
// Evaluate the code honestly across these areas:
// - Does it fulfill the task requirements?
// - Is the code structure clean and logical?
// - Are errors handled properly?
// - Are there any security issues (hardcoded secrets, no validation)?
// - Is there documentation or a README?
// - Are there any tests?
// - Is the naming clear and consistent?

// DIMENSION 2 — AI CODE DETECTION
// You must estimate what percentage of this code was written by the human vs generated by AI (ChatGPT, Copilot, Claude, etc.)

// Patterns that strongly suggest AI-GENERATED code:
// - Every single function has a JSDoc comment block, even trivial ones
// - Extremely verbose and formal comments that explain obvious things
// - Perfect symmetry — every file follows identical patterns with zero variation
// - Generic variable names like "data", "result", "response", "items" used everywhere
// - Overly complete boilerplate that no human would write from scratch in one session
// - README sounds like marketing copy ("This project leverages cutting-edge...")
// - Error messages that are too polished and complete for a take-home task
// - No TODOs, no commented-out code, no debugging artifacts — too clean
// - Code that solves the generic version of the problem instead of the SPECIFIC task
// - Inconsistent style between files suggesting multiple AI prompt sessions
// - Missing personal utility functions or shortcuts that experienced devs naturally reuse

// Patterns that strongly suggest HUMAN-WRITTEN code:
// - Natural inconsistencies in spacing, style, or naming across files
// - Personal helper functions or utilities that solve their specific approach
// - TODOs with specific personal notes ("// TODO: clean this up later - ran out of time")
// - Commented-out experiments showing their thought process
// - Naming choices that reflect personal preference, not AI defaults
// - Code that directly addresses the exact task requirements, not a general template
// - Logical progression in how files are structured — shows real problem-solving
// - Small imperfections that AI would have "fixed" (minor typos in comments, etc.)
// - Non-standard but clever solutions that show genuine understanding
// - Signs of iteration: some parts cleaner than others

// ══════════════════════════════════════
// RETURN EXACTLY THIS JSON (nothing else):
// ══════════════════════════════════════
// {
//   "overallScore": 8,
//   "codeQuality": 7,
//   "completeness": 9,
//   "correctness": 8,
//   "summary": "2-3 sentence overall assessment. Reference specific files or patterns you actually observed.",
//   "strengths": [
//     "Specific strength with file reference e.g. 'auth.ts has clean JWT implementation'",
//     "Another specific strength",
//     "Another specific strength"
//   ],
//   "improvements": [
//     "Specific improvement e.g. 'No error handling in /api/users POST route'",
//     "Another specific improvement",
//     "Another specific improvement"
//   ],
//   "recommendation": "Hire",
//   "details": {
//     "architecture": "Describe the structure you observed",
//     "testing": "Describe test coverage or lack of it",
//     "documentation": "Describe README and inline comments quality",
//     "security": "Describe security practices observed"
//   },
//   "aiCodeAnalysis": {
//     "humanCodePercent": 65,
//     "aiCodePercent": 35,
//     "confidence": "High",
//     "verdict": "One sentence verdict e.g. Mostly human-written with AI assistance on boilerplate",
//     "humanSignals": [
//       "Specific human signal e.g. TODOs with personal notes in utils.ts",
//       "Another specific human signal"
//     ],
//     "aiSignals": [
//       "Specific AI signal e.g. Every function in routes.ts has identical JSDoc structure",
//       "Another specific AI signal"
//     ]
//   }
// }

// STRICT RULES:
// - overallScore, codeQuality, completeness, correctness: integers 1-10
// - humanCodePercent + aiCodePercent MUST equal exactly 100
// - confidence: exactly "High", "Medium", or "Low"
// - recommendation: exactly "Hire", "Maybe", or "Reject"
// - strengths: 2-4 items, each must reference something specific you actually saw
// - improvements: 2-4 items, each must be actionable and specific
// - humanSignals: 1-4 items (empty array [] if zero human signals found)
// - aiSignals: 1-4 items (empty array [] if zero AI signals found)
// - If no code was submitted: overallScore = 1, recommendation = "Reject"`
//         }
//       ],
//       temperature: 0.1,
//       max_tokens: 2000
//     })

//     const text = response2.choices[0].message.content ?? ""
//     const clean = text.replace(/```json|```/g, "").trim()

//     let evaluation: any
//     try {
//       evaluation = JSON.parse(clean)
//     } catch {
//       // Try regex extraction if AI added extra text
//       const match = clean.match(/\{[\s\S]*\}/)
//       if (match) {
//         try { evaluation = JSON.parse(match[0]) } catch { evaluation = null }
//       }
//     }

//     if (!evaluation) {
//       evaluation = {
//         overallScore: 5,
//         codeQuality: 5,
//         completeness: 5,
//         correctness: 5,
//         summary: "Evaluation completed but could not be fully parsed.",
//         strengths: [],
//         improvements: ["Could not fully evaluate submission"],
//         recommendation: "Maybe",
//         details: { architecture: "N/A", testing: "N/A", documentation: "N/A", security: "N/A" },
//         aiCodeAnalysis: {
//           humanCodePercent: 50,
//           aiCodePercent: 50,
//           confidence: "Low",
//           verdict: "Could not determine",
//           humanSignals: [],
//           aiSignals: []
//         }
//       }
//     }

//     // Ensure percentages add up to 100
//     if (evaluation.aiCodeAnalysis) {
//       const h = Math.min(100, Math.max(0, Math.round(evaluation.aiCodeAnalysis.humanCodePercent ?? 50)))
//       evaluation.aiCodeAnalysis.humanCodePercent = h
//       evaluation.aiCodeAnalysis.aiCodePercent = 100 - h
//     }

//     // Save AI report to DB
//     await prisma.task.update({
//       where: { id: taskId },
//       data: {
//         status:"EVALUATED",
//         aiReport: evaluation,
//         aiScore: evaluation.overallScore ?? 5
//       }
//     })



//   } catch (err: any) {
//     logger.error("AI evaluation failed:", err.message)
//   }
// }