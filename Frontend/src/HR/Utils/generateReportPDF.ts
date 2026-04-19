// Generates professional interview evaluation report PDF using jsPDF

import jsPDF from "jspdf"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  id: string
  status: string
  scheduledAt: string | null
  createdAt: string
  feedback: any
  developer: {
    developerName: string
    developerEmail: string
    position: string
    experience: number
    skills: string | null
    aiSummary: string | null
  }
  hr: {
    name: string
    companyName: string
    email: string
  }
  answers: {
    answerText: string
    score: number | null
    feedback: string | null
    question: {
      questionText: string
      difficulty: string
      orderIndex: number
    }
  }[]
  codeAnswers: {
    language: string
    codeStatus: string | null
    question: { questionText: string }
  }[]
  note: { content: string } | null
  task: {
    aiScore: number | null
    aiReport: any
    submittedAt: string | null
    taskLibrary: {
      title: string
      description: string
      techStack: string
      category: string
    }
  } | null
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],   // blue-600
  dark: [17, 24, 39] as [number, number, number],   // gray-900
  gray: [107, 114, 128] as [number, number, number],   // gray-500
  lightGray: [243, 244, 246] as [number, number, number],   // gray-100
  green: [22, 163, 74] as [number, number, number],   // green-600
  yellow: [202, 138, 4] as [number, number, number],   // yellow-600
  red: [220, 38, 38] as [number, number, number],   // red-600
  white: [255, 255, 255] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],   // gray-200
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (score: number): [number, number, number] =>
  score >= 8 ? COLORS.green : score >= 5 ? COLORS.yellow : COLORS.red

const recColor = (rec: string): [number, number, number] =>
  rec === "HIRE" ? COLORS.green : rec === "MAYBE" ? COLORS.yellow : COLORS.red

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  })

// Wrap text to fit width
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] =>
  doc.splitTextToSize(text, maxWidth)

// ─── Page setup ───────────────────────────────────────────────────────────────

const PAGE_W = 210  // A4 width mm
const PAGE_H = 297  // A4 height mm
const MARGIN = 20
const CONTENT_W = PAGE_W - MARGIN * 2

// ─── Main PDF generator ───────────────────────────────────────────────────────

const buildPDF = (data: ReportData): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const fb = data.feedback ?? {}
  const dev = data.developer
  const hr = data.hr
  const task = data.task

  let y = 0 // current Y position

  // ── Helper: add new page if needed ────────────────────────────────────────
  const checkPage = (needed = 20) => {
    if (y + needed > PAGE_H - 15) {
      doc.addPage()
      y = MARGIN
    }
  }

  // ── Helper: section header ─────────────────────────────────────────────────
  const sectionHeader = (title: string) => {
    checkPage(18)
    y += 6
    doc.setFillColor(...COLORS.primary)
    doc.rect(MARGIN, y, CONTENT_W, 7, "F")
    doc.setTextColor(...COLORS.white)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text(title.toUpperCase(), MARGIN + 4, y + 4.8)
    doc.setTextColor(...COLORS.dark)
    y += 12
  }

  // ── Helper: labeled field ──────────────────────────────────────────────────
  const field = (label: string, value: string, x = MARGIN, w = CONTENT_W) => {
    checkPage(12)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.gray)
    doc.text(label.toUpperCase(), x, y)
    y += 4
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.dark)
    const lines = wrapText(doc, value, w)
    lines.forEach(line => {
      checkPage(5)
      doc.text(line, x, y)
      y += 4.5
    })
    y += 2
  }

  // ── Helper: score bar ──────────────────────────────────────────────────────
  const scoreBar = (label: string, score: number, max = 10) => {
    checkPage(10)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.dark)
    doc.text(label, MARGIN, y)
    const scoreText = `${score}/${max}`
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...scoreColor(score))
    doc.text(scoreText, MARGIN + CONTENT_W - doc.getTextWidth(scoreText), y)
    doc.setTextColor(...COLORS.dark)
    y += 4
    // Background bar
    doc.setFillColor(...COLORS.lightGray)
    doc.roundedRect(MARGIN, y, CONTENT_W, 3, 1, 1, "F")
    // Score fill
    doc.setFillColor(...scoreColor(score))
    doc.roundedRect(MARGIN, y, (score / max) * CONTENT_W, 3, 1, 1, "F")
    y += 7
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════════════════════════

  // Blue header band
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, PAGE_W, 55, "F")

  // Company + logo text
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("SKILLFORGE AI", MARGIN, 14)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text("Interview Intelligence Platform", MARGIN, 19)

  // Report title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("INTERVIEW EVALUATION REPORT", MARGIN, 35)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`${hr.companyName} · ${data.scheduledAt ? formatDate(data.scheduledAt) : formatDate(data.createdAt ?? "")}`, MARGIN, 43)

  doc.setTextColor(...COLORS.dark)
  y = 70

  // Candidate info card
  doc.setFillColor(...COLORS.lightGray)
  doc.roundedRect(MARGIN, y, CONTENT_W, 45, 3, 3, "F")

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.dark)
  doc.text(dev.developerName, MARGIN + 6, y + 12)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.gray)
  doc.text(`${dev.position} · ${dev.experience} year${dev.experience !== 1 ? "s" : ""} experience`, MARGIN + 6, y + 19)
  doc.text(dev.developerEmail, MARGIN + 6, y + 25)

  // Recommendation badge
  if (fb.recommendation) {
    const rec = fb.recommendation as string
    doc.setFillColor(...recColor(rec))
    doc.roundedRect(MARGIN + 6, y + 31, 30, 7, 2, 2, "F")
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.white)
    doc.text(rec.replace("_", " "), MARGIN + 10, y + 36)
    doc.setTextColor(...COLORS.dark)
  }

  // Overall score
  if (fb.overallScore) {
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...scoreColor(fb.overallScore))
    const scoreStr = `${fb.overallScore}/10`
    doc.text(scoreStr, MARGIN + CONTENT_W - doc.getTextWidth(scoreStr) - 6, y + 20)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.gray)
    doc.text("OVERALL SCORE", MARGIN + CONTENT_W - 28, y + 26)
    doc.setTextColor(...COLORS.dark)
  }

  y += 55

  // Interviewer info
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.gray)
  doc.text(`Interviewer: ${hr.name} · ${hr.companyName} · ${hr.email}`, MARGIN, y)
  y += 8
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, MARGIN, y)
  doc.setTextColor(...COLORS.dark)

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 1 — Executive Summary
  // ════════════════════════════════════════════════════════════════════════════

  if (fb.summary) {
    sectionHeader("1. Executive Summary")
    const summaryLines = wrapText(doc, fb.summary, CONTENT_W)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    summaryLines.forEach(line => {
      checkPage(5)
      doc.text(line, MARGIN, y)
      y += 5
    })
    y += 4
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 2 — Candidate Profile
  // ════════════════════════════════════════════════════════════════════════════

  sectionHeader("2. Candidate Profile")

  // Two-column layout
  const colW = (CONTENT_W - 8) / 2
  const col2 = MARGIN + colW + 8

  field("Full Name", dev.developerName, MARGIN, colW)
  const tempY = y
  y -= (4 * 3) // go back up to align second column
  field("Position", dev.position, col2, colW)
  const afterName = y
  y = tempY > afterName ? tempY : afterName

  field("Email", dev.developerEmail, MARGIN, colW)
  const tempY2 = y
  y -= (4 * 3)
  field("Experience", `${dev.experience} year${dev.experience !== 1 ? "s" : ""}`, col2, colW)
  y = Math.max(tempY2, y)

  if (dev.skills) {
    const skillArr = (() => {
      try { return JSON.parse(dev.skills!) }
      catch { return dev.skills?.split("|") ?? [] }
    })()
    field("Skills", Array.isArray(skillArr) ? skillArr.join(", ") : dev.skills)
  }

  if (dev.aiSummary) {
    field("AI Summary", dev.aiSummary)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 3 — Performance Breakdown
  // ════════════════════════════════════════════════════════════════════════════

  if (fb.technicalScore || fb.communicationScore || fb.codeQualityScore || fb.taskScore) {
    sectionHeader("3. Performance Breakdown")
    if (fb.technicalScore) scoreBar("Technical Skills", fb.technicalScore)
    if (fb.communicationScore) scoreBar("Communication", fb.communicationScore)
    if (fb.codeQualityScore) scoreBar("Code Quality", fb.codeQualityScore)
    if (fb.taskScore) scoreBar("Task Performance", fb.taskScore)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 4 — Q&A Performance
  // ════════════════════════════════════════════════════════════════════════════

  if (data.answers.length > 0) {
    sectionHeader("4. Technical Q&A Performance")

    if (fb.qaAnalysis) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(...COLORS.gray)
      const lines = wrapText(doc, fb.qaAnalysis, CONTENT_W)
      lines.forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 5
      })
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      y += 4
    }

    data.answers.forEach((ans, idx) => {
      checkPage(25)

      // Question number + difficulty
      doc.setFillColor(...COLORS.lightGray)
      doc.roundedRect(MARGIN, y, CONTENT_W, 6, 1, 1, "F")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.dark)
      doc.text(`Q${idx + 1}. ${ans.question.difficulty.toUpperCase()}`, MARGIN + 3, y + 4.3)

      if (ans.score != null) {
        doc.setTextColor(...scoreColor(ans.score))
        const sc = `${ans.score}/10`
        doc.text(sc, MARGIN + CONTENT_W - doc.getTextWidth(sc) - 3, y + 4.3)
        doc.setTextColor(...COLORS.dark)
      }
      y += 9

      // Question text
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      const qLines = wrapText(doc, ans.question.questionText, CONTENT_W)
      qLines.slice(0, 2).forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 4.5
      })
      y += 2

      // AI feedback
      if (ans.feedback) {
        let fText = ""
        let strengths = ""
        let missing = ""

        try {
          const parsed = JSON.parse(ans.feedback)
          fText = parsed.feedback || ""
          strengths = parsed.strengths || ""
          missing = parsed.missing || ""
        } catch {
          fText = ans.feedback
        }

        doc.setFontSize(7.5)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...COLORS.gray)

        const renderBlock = (label: string, text: string, color: [number, number, number]) => {
          if (!text || text === "None" || text === "N/A") return
          const lines = wrapText(doc, `${label}: ${text}`, CONTENT_W)
          doc.setTextColor(...color)
          lines.slice(0, 5).forEach(line => {
            checkPage(5)
            doc.text(line, MARGIN, y)
            y += 4
          })
          doc.setTextColor(...COLORS.gray)
          y += 1
        }

        renderBlock("Feedback", fText, COLORS.dark)
        renderBlock("Strengths", strengths, COLORS.green)
        renderBlock("Missing", missing, COLORS.red)
      }
      y += 4
    })
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 5 — Code Assessment
  // ════════════════════════════════════════════════════════════════════════════

  if (data.codeAnswers.length > 0 || fb.codeAnalysis) {
    sectionHeader("5. Coding Assessment")

    if (fb.codeAnalysis) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(...COLORS.gray)
      const lines = wrapText(doc, fb.codeAnalysis, CONTENT_W)
      lines.forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 5
      })
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      y += 3
    }

    data.codeAnswers.forEach((ca, idx) => {
      checkPage(16)
      doc.setFillColor(...COLORS.lightGray)
      doc.roundedRect(MARGIN, y, CONTENT_W, 6, 1, 1, "F")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text(`Problem ${idx + 1}`, MARGIN + 3, y + 4.3)

      const statusColor = ca.codeStatus === "Accepted" ? COLORS.green : COLORS.red
      doc.setTextColor(...statusColor)
      const status = ca.codeStatus ?? "N/A"
      doc.text(status, MARGIN + CONTENT_W - doc.getTextWidth(status) - 3, y + 4.3)
      doc.setTextColor(...COLORS.dark)
      y += 9

      doc.setFontSize(7.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.gray)
      doc.text(`Language: ${ca.language}`, MARGIN, y)
      y += 4
      const qLines = wrapText(doc, ca.question.questionText, CONTENT_W)
      qLines.slice(0, 2).forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 4
      })
      doc.setTextColor(...COLORS.dark)
      y += 4
    })
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 6 — Task Evaluation
  // ════════════════════════════════════════════════════════════════════════════

  if (task) {
    sectionHeader("6. Take-Home Task Evaluation")

    field("Task", task.taskLibrary.title)
    field("Tech Stack", task.taskLibrary.techStack)

    if (task.aiScore != null) {
      checkPage(10)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("AI Score:", MARGIN, y)
      doc.setTextColor(...scoreColor(Math.round(task.aiScore / 10)))
      doc.text(`${task.aiScore}/100`, MARGIN + 22, y)
      doc.setTextColor(...COLORS.dark)
      y += 8
    }

    if (fb.taskAnalysis) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(...COLORS.gray)
      const lines = wrapText(doc, fb.taskAnalysis, CONTENT_W)
      lines.forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 5
      })
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      y += 3
    }

    // AI report details
    if (task.aiReport) {
      const rep = typeof task.aiReport === "string"
        ? JSON.parse(task.aiReport) : task.aiReport

      if (rep.strengths?.length > 0) {
        checkPage(15)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.green)
        doc.text("Strengths:", MARGIN, y)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...COLORS.dark)
        y += 5
        rep.strengths.slice(0, 3).forEach((s: string) => {
          checkPage(5)
          doc.setFontSize(7.5)
          doc.text(`• ${s}`, MARGIN + 3, y)
          y += 4.5
        })
        y += 2
      }

      if (rep.improvements?.length > 0) {
        checkPage(15)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.yellow)
        doc.text("Areas for Improvement:", MARGIN, y)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...COLORS.dark)
        y += 5
        rep.improvements.slice(0, 3).forEach((s: string) => {
          checkPage(5)
          doc.setFontSize(7.5)
          doc.text(`• ${s}`, MARGIN + 3, y)
          y += 4.5
        })
        y += 2
      }

      // AI code detection
      if (rep.aiCodeAnalysis?.humanCodePercent != null) {
        checkPage(16)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("Code Originality:", MARGIN, y)
        y += 5
        const humanPct = rep.aiCodeAnalysis.humanCodePercent
        const aiPct = rep.aiCodeAnalysis.aiCodePercent

        doc.setFillColor(...COLORS.primary)
        doc.rect(MARGIN, y, (humanPct / 100) * CONTENT_W, 4, "F")
        doc.setFillColor(251, 146, 60) // orange
        doc.rect(MARGIN + (humanPct / 100) * CONTENT_W, y, (aiPct / 100) * CONTENT_W, 4, "F")
        y += 7

        doc.setFontSize(7.5)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...COLORS.primary)
        doc.text(`Human: ${humanPct}%`, MARGIN, y)
        doc.setTextColor(251, 146, 60)
        doc.text(`AI Generated: ${aiPct}%`, MARGIN + 40, y)
        doc.setTextColor(...COLORS.dark)
        y += 6
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 7 — Strengths & Weaknesses
  // ════════════════════════════════════════════════════════════════════════════

  if (fb.strengths?.length > 0 || fb.weaknesses?.length > 0) {
    sectionHeader("7. Strengths & Areas for Development")

    const colW2 = (CONTENT_W - 6) / 2
    const startY = y

    if (fb.strengths?.length > 0) {
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.green)
      doc.text("✓ Strengths", MARGIN, y)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      y += 5
      fb.strengths.forEach((s: string) => {
        checkPage(6)
        doc.setFontSize(7.5)
        const lines = wrapText(doc, `• ${s}`, colW2)
        lines.forEach(line => {
          doc.text(line, MARGIN, y)
          y += 4
        })
      })
    }

    const afterLeft = y
    y = startY

    if (fb.weaknesses?.length > 0) {
      const col2x = MARGIN + colW2 + 6
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.red)
      doc.text("△ Areas to Improve", col2x, y)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      y += 5
      fb.weaknesses.forEach((w: string) => {
        checkPage(6)
        doc.setFontSize(7.5)
        const lines = wrapText(doc, `• ${w}`, colW2)
        lines.forEach(line => {
          doc.text(line, col2x, y)
          y += 4
        })
      })
    }

    y = Math.max(afterLeft, y) + 4
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 8 — HR Observations
  // ════════════════════════════════════════════════════════════════════════════

  if (data.note?.content || fb.hrNotesSummary) {
    sectionHeader("8. HR Observations")
    if (fb.hrNotesSummary) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(...COLORS.gray)
      const lines = wrapText(doc, fb.hrNotesSummary, CONTENT_W)
      lines.forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 5
      })
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 9 — Final Verdict
  // ════════════════════════════════════════════════════════════════════════════

  if (fb.recommendation || fb.hiringRationale) {
    sectionHeader("9. Final Hiring Verdict")

    if (fb.recommendation) {
      checkPage(20)
      const rec = fb.recommendation as string
      doc.setFillColor(...recColor(rec))
      doc.roundedRect(MARGIN, y, 50, 10, 2, 2, "F")
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.white)
      const recText = rec.replace("_", " ")
      doc.text(recText, MARGIN + 25 - doc.getTextWidth(recText) / 2, y + 6.8)
      doc.setTextColor(...COLORS.dark)
      y += 16
    }

    if (fb.hiringRationale) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      const lines = wrapText(doc, fb.hiringRationale, CONTENT_W)
      lines.forEach(line => {
        checkPage(5)
        doc.text(line, MARGIN, y)
        y += 5
      })
    }
  }

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = (doc as any).internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(...COLORS.lightGray)
    doc.rect(0, PAGE_H - 10, PAGE_W, 10, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.gray)
    doc.text("SkillForge AI — Confidential Interview Report", MARGIN, PAGE_H - 4)
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN - 15, PAGE_H - 4)
  }

  return doc
}

// ─── Public exports ───────────────────────────────────────────────────────────

const getFileName = (data: ReportData): string => {
  const name = data.developer.developerName.replace(/\s+/g, "_")
  const pos = data.developer.position.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
  return `${name}_${pos}_Interview_Report.pdf`
}

// Download PDF directly
export const generateReportPDF = async (data: ReportData): Promise<void> => {
  const doc = buildPDF(data)
  const fileName = getFileName(data)
  doc.save(fileName)
}

// Return base64 for email attachment
export const generateReportPDFBase64 = async (
  data: ReportData
): Promise<{ base64: string; fileName: string }> => {
  const doc = buildPDF(data)
  const fileName = getFileName(data)
  // jsPDF output as base64 string
  const base64 = doc.output("datauristring").split(",")[1]
  return { base64, fileName }
}