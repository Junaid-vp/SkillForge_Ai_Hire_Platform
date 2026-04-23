
// RabbitMQ Queue for AI Task Evaluation


import amqp, { type Channel, type Connection } from "amqplib"
import { prisma } from "../Lib/prisma.js"
import Groq from "groq-sdk"
import AdmZip from "adm-zip"
import fs from "fs"
import { createNotification } from "./NotificationService.js"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Queue name — visible in RabbitMQ dashboard
const QUEUE = "task_evaluation"

// ── Job data shape ─────────────────────────────
export interface TaskEvalJobData {
  taskId: string
  filePath: string
  task: {
    hrId: string
    taskLibrary: {
      title: string
      description: string
      requirements: string
      techStack: string
    }
    developer: { developerName: string }
  }
}

// ── Singleton connection ───────────────────────
// One connection shared across all operations
let connection: Connection | null = null
let channel: Channel | null = null

async function getChannel(): Promise<Channel> {
  if (channel) return channel

  const url = process.env.RABBITMQ_URL ?? "amqp://localhost:5672"
  let retries = 5

  while (retries > 0) {
    try {
      const conn = await amqp.connect(url) as any
      connection = conn
      const ch = await conn.createChannel() as any
      channel = ch

      // durable: true = queue survives RabbitMQ restart
      await ch.assertQueue(QUEUE, { durable: true })
      ch.prefetch(1)

      console.log(`✅ RabbitMQ connected — queue: "${QUEUE}"`)

      conn.on("error", () => { connection = null; channel = null })
      conn.on("close", () => { connection = null; channel = null })

      return ch
    } catch (err: any) {
      retries--
      console.warn(`⏳ Waiting for RabbitMQ... (${retries} retries left) - ${err.message}`)
      if (retries === 0) throw err
      await new Promise(res => setTimeout(res, 5000)) // Wait 5 seconds
    }
  }
  throw new Error("Failed to connect to RabbitMQ after retries")
}

// ══════════════════════════════════════════════
// PRODUCER — Called from TaskController.submitTask()
// Puts the job INTO the queue
// ══════════════════════════════════════════════
export async function enqueueTaskEvaluation(data: TaskEvalJobData): Promise<void> {
  try {
    const ch = await getChannel()

    // persistent: true = job survives RabbitMQ restart
    ch.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    )

    console.log(`📤 Queued task evaluation — taskId: ${data.taskId}`)

  } catch (err: any) {
    console.error("RabbitMQ enqueue error:", err.message)

    // FALLBACK: if RabbitMQ is down, run inline so developer still gets result
    console.warn("⚠️  Running evaluation inline (RabbitMQ unavailable)")
    evaluateTaskWithAI(data).catch(e => console.error("Inline eval error:", e.message))
  }
}

// ══════════════════════════════════════════════
// CONSUMER — Called once from server.ts on startup
// Listens for jobs and processes them
// ══════════════════════════════════════════════
export async function startTaskWorker(): Promise<void> {
  try {
    const ch = await getChannel()
    console.log(`🔄 RabbitMQ worker listening on "${QUEUE}"...`)

    ch.consume(QUEUE, async (msg) => {
      if (!msg) return

      let data: TaskEvalJobData | null = null

      try {
        data = JSON.parse(msg.content.toString()) as TaskEvalJobData
        console.log(`⚙️  Processing — taskId: ${data.taskId}`)

        await evaluateTaskWithAI(data)

        // ✅ ack = job done successfully, remove from queue
        ch.ack(msg)
        console.log(`✅ Completed — taskId: ${data.taskId}`)

      } catch (err: any) {
        console.error(`❌ Failed — taskId: ${data?.taskId}`, err.message)

        // nack = job failed, discard (don't requeue to avoid infinite loop)
        ch.nack(msg, false, false)
      }
    }, { noAck: false })

  } catch (err: any) {
    console.error("RabbitMQ worker start error:", err.message)
    console.warn("⚠️  Worker not started — evaluations run inline as fallback")
  }
}

// ── Graceful shutdown ──────────────────────────
export async function closeTaskQueue(): Promise<void> {
  try {
    if (channel) await (channel as any).close()
    if (connection) await (connection as any).close()
    console.log("✅ RabbitMQ closed gracefully")
  } catch { }
}

// ══════════════════════════════════════════════
// AI EVALUATION — The actual work
// Same logic as your original TaskController
// but extracted here so it runs inside the worker
// ══════════════════════════════════════════════
async function evaluateTaskWithAI(data: TaskEvalJobData): Promise<void> {
  const { taskId, filePath, task } = data

  try {
    // ── Read ZIP ─────────────────────────────────
    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()

    const skipFolders = [
      "node_modules", ".git", "dist", "build", ".next",
      "coverage", ".cache", "__pycache__", "vendor"
    ]
    const codeExts = [
      ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".cpp", ".c",
      ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt",
      ".html", ".css", ".scss", ".json", ".md", ".env.example",
      ".prisma", ".sql", ".yaml", ".yml"
    ]

    const maxPromptChars = 28_000
    let codeContent = ""
    let fileCount = 0
    const includedFiles: string[] = []

    for (const entry of entries) {
      if (entry.isDirectory) continue
      if (skipFolders.some(f => entry.entryName.includes(f))) continue

      const ext = "." + entry.entryName.split(".").pop()?.toLowerCase()
      if (!codeExts.includes(ext)) continue

      const content = entry.getData().toString("utf8")
      if (content.length > 5000) continue

      const chunk = `\n\n// FILE: ${entry.entryName}\n${content}`
      if (codeContent.length + chunk.length > maxPromptChars) break

      codeContent += chunk
      fileCount++
      includedFiles.push(entry.entryName)
      if (fileCount >= 20) break
    }

    if (!codeContent) codeContent = "No readable code files found in submission"

    // ── Build prompt ─────────────────────────────
    const prompt = `You are evaluating a take-home coding task submitted by a job candidate.

══════════════════════════════════════
TASK DETAILS
══════════════════════════════════════
Title:        ${task.taskLibrary.title}
Description:  ${task.taskLibrary.description}
Requirements: ${task.taskLibrary.requirements}
Tech Stack:   ${task.taskLibrary.techStack}

══════════════════════════════════════
FILES INCLUDED (${fileCount})
══════════════════════════════════════
${includedFiles.join("\n")}

══════════════════════════════════════
SUBMITTED CODE
══════════════════════════════════════
${codeContent}

Evaluate technical quality AND detect AI-generated vs human-written code.`

    // ── Call Groq AI ─────────────────────────────
    const createCompletion = async (content: string) =>
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a senior software engineer and technical hiring manager.
You review code submissions and detect AI-generated code vs human-written code.
Return ONLY valid JSON. No markdown. No explanation outside the JSON.`
          },
          {
            role: "user",
            content: `${content}

RETURN EXACTLY THIS JSON (nothing else):
{
  "overallScore": 8,
  "codeQuality": 7,
  "completeness": 9,
  "correctness": 8,
  "summary": "2-3 sentence assessment referencing actual files.",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "recommendation": "Hire",
  "details": {
    "architecture": "...",
    "testing": "...",
    "documentation": "...",
    "security": "..."
  },
  "aiCodeAnalysis": {
    "humanCodePercent": 65,
    "aiCodePercent": 35,
    "confidence": "High",
    "verdict": "...",
    "humanSignals": ["..."],
    "aiSignals": ["..."]
  }
}

STRICT RULES:
- overallScore, codeQuality, completeness, correctness: integers 1-10
- humanCodePercent + aiCodePercent MUST equal exactly 100
- confidence: exactly "High", "Medium", or "Low"
- recommendation: exactly "Hire", "Maybe", or "Reject"`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      })

    // ── Parse response ────────────────────────────
    const response = await createCompletion(prompt)
    const raw = response.choices[0]?.message?.content ?? ""
    const clean = raw.replace(/```json|```/g, "").trim()

    let evaluation: any
    try {
      evaluation = JSON.parse(clean)
    } catch {
      // Second attempt — ask AI to repair JSON
      try {
        const repair = await createCompletion(
          `Fix this into VALID JSON ONLY. Output JSON object only.\n\n${clean.slice(0, 8000)}`
        )
        const repairedRaw = repair.choices[0]?.message?.content ?? ""
        evaluation = JSON.parse(repairedRaw.replace(/```json|```/g, "").trim())
      } catch {
        evaluation = null
      }
    }

    // ── Fallback if parse completely failed ───────
    if (!evaluation) {
      evaluation = {
        overallScore: 5, codeQuality: 5, completeness: 5, correctness: 5,
        summary: "Evaluation completed but response could not be parsed.",
        strengths: [], improvements: ["Could not fully evaluate submission"],
        recommendation: "Maybe",
        details: { architecture: "N/A", testing: "N/A", documentation: "N/A", security: "N/A" },
        aiCodeAnalysis: {
          humanCodePercent: 50, aiCodePercent: 50,
          confidence: "Low", verdict: "Could not determine",
          humanSignals: [], aiSignals: []
        }
      }
    }

    // ── Ensure percents sum to 100 ────────────────
    if (evaluation.aiCodeAnalysis) {
      const h = Math.min(100, Math.max(0, Math.round(evaluation.aiCodeAnalysis.humanCodePercent ?? 50)))
      evaluation.aiCodeAnalysis.humanCodePercent = h
      evaluation.aiCodeAnalysis.aiCodePercent = 100 - h
    }

    // ── Save to database ──────────────────────────
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "EVALUATED" as any,
        aiReport: evaluation,
        aiScore: evaluation.overallScore ?? 5,
      }
    })

    // ── Notify HR ─────────────────────────────────
    await createNotification(
      task.hrId,
      "Task Evaluated",
      `Task "${task.taskLibrary.title}" by ${task.developer.developerName} has been evaluated. Score: ${evaluation.overallScore}/10`,
      "TASK_EVALUATED",
      true
    )

    console.log(`📊 Evaluation saved — taskId: ${taskId} score: ${evaluation.overallScore}/10`)

  } catch (err: any) {
    console.error("evaluateTaskWithAI error:", err.message)
    throw err // re-throw so RabbitMQ calls nack()
  } finally {
    // Always delete temp ZIP file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`🗑️  Deleted temp file: ${filePath}`)
      }
    } catch { /* ignore */ }
  }
}