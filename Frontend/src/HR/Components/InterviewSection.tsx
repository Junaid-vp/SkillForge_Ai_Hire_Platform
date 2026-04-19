import {
  CalendarDays, Shield, MessageSquare, Sparkles,
  Loader2, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Code2, FileText, Mic, Info,
} from "lucide-react";
import { SectionCard, InfoRow, Badge, EmptyCard } from "./SectionCard";
import { type Interview, type Task, STATUS_STYLES, formatDate } from "../Types/developer.types";
import { useState } from "react";
import { api } from "../../Api/Axios";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FeedbackReport {
  overallScore:       number;
  recommendation:     "HIRE" | "MAYBE" | "NO_HIRE";
  summary:            string;
  technicalScore:     number;
  communicationScore: number;
  codeQualityScore:   number;
  taskScore:          number;
  strengths:          string[];
  weaknesses:         string[];
  qaAnalysis:         string;
  codeAnalysis:       string;
  taskAnalysis:       string;
  hrNotesSummary:     string;
  hiringRationale:    string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const RECOMMENDATION_CONFIG = {
  HIRE:    { label: "Hire",    bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: <CheckCircle2 size={13} /> },
  MAYBE:   { label: "Maybe",   bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: <AlertCircle  size={13} /> },
  NO_HIRE: { label: "No Hire", bg: "bg-red-50",     border: "border-red-200",     text: "text-red-600",     icon: <XCircle      size={13} /> },
}

const scoreColor = (s: number) =>
  s >= 8 ? "bg-emerald-500" : s >= 6 ? "bg-blue-500" : s >= 4 ? "bg-amber-500" : "bg-red-500"

const scoreTextColor = (s: number) =>
  s >= 8 ? "text-emerald-600" : s >= 6 ? "text-blue-600" : s >= 4 ? "text-amber-600" : "text-red-600"

function ScoreBar({ label, icon, value }: { label: string; icon: React.ReactNode; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          {icon} {label}
        </div>
        <span className={`text-xs font-bold ${scoreTextColor(value)}`}>{value}/10</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreColor(value)}`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ── Feedback Card ─────────────────────────────────────────────────────────────
function FeedbackCard({ feedback, interviewId }: { feedback: FeedbackReport; interviewId: string }) {
  const rec        = RECOMMENDATION_CONFIG[feedback.recommendation] ?? RECOMMENDATION_CONFIG.MAYBE
  const overallPct = (feedback.overallScore / 10) * 100

  return (
    <div className="space-y-4">

      {/* Header — Overall + Recommendation */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">

        {/* Circular score */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={
                feedback.overallScore >= 8 ? "#10b981"
                : feedback.overallScore >= 6 ? "#3b82f6"
                : feedback.overallScore >= 4 ? "#f59e0b"
                : "#ef4444"
              }
              strokeWidth="3"
              strokeDasharray={`${overallPct} ${100 - overallPct}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${scoreTextColor(feedback.overallScore)}`}>
              {feedback.overallScore}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-bold text-gray-800">Overall Score</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${rec.bg} ${rec.border} ${rec.text}`}>
              {rec.icon} {rec.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">{feedback.summary}</p>
        </div>
      </div>

      {/* Score bars */}
      <div className="p-4 border border-gray-100 rounded-xl space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Performance Breakdown
        </p>
        <ScoreBar label="Technical"     icon={<TrendingUp size={10} />} value={feedback.technicalScore}     />
        <ScoreBar label="Communication" icon={<Mic        size={10} />} value={feedback.communicationScore} />
        <ScoreBar label="Code Quality"  icon={<Code2      size={10} />} value={feedback.codeQualityScore}   />
        <ScoreBar label="Task"          icon={<FileText   size={10} />} value={feedback.taskScore}          />
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-2">
            Strengths
          </p>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800">
                <CheckCircle2 size={10} className="mt-0.5 shrink-0 text-emerald-500" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600 mb-2">
            Weaknesses
          </p>
          <ul className="space-y-1">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-red-800">
                <XCircle size={10} className="mt-0.5 shrink-0 text-red-400" /> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Analysis sections */}
      {[
        { label: "Q&A Performance",  icon: <MessageSquare size={10} />, content: feedback.qaAnalysis      },
        { label: "Code Analysis",    icon: <Code2         size={10} />, content: feedback.codeAnalysis    },
        { label: "Task Analysis",    icon: <FileText      size={10} />, content: feedback.taskAnalysis    },
        { label: "HR Observations",  icon: <Mic           size={10} />, content: feedback.hrNotesSummary  },
        { label: "Hiring Rationale", icon: <TrendingUp    size={10} />, content: feedback.hiringRationale },
      ].map(({ label, icon, content }) => (
        <div key={label} className="p-3 border border-gray-100 rounded-xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
            {icon} {label}
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed">{content}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function InterviewSection({ interview, task }: { interview: Interview | null; task?: Task | null }) {
  const [feedback,   setFeedback]   = useState<FeedbackReport | null>(
    (interview?.feedback as FeedbackReport) ?? null
  )
  const [generating, setGenerating] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [loaded,     setLoaded]     = useState(false)

  if (!interview) {
    return (
      <SectionCard
        icon={<CalendarDays size={13} className="text-blue-600" />}
        title="Interview Details"
        subtitle="Scheduled interview information"
      >
        <EmptyCard message="No interview scheduled yet." />
      </SectionCard>
    )
  }

  const statusStyle = STATUS_STYLES[interview.status] ?? STATUS_STYLES.PENDING
  const isCompleted = interview.status === "COMPLETED"

  // Task restriction logic
  const hasTask      = !!task
  const isTaskReady  = hasTask && (task.status === "EVALUATED" || task.status === "EXPIRED")
  const taskStatusMessage = !hasTask 
    ? "Please assign a task first to generate feedback."
    : !isTaskReady
      ? `Task is currently ${task.status}. Wait for evaluation or expiry.`
      : null

  const handleGenerate = async () => {
    if (!isTaskReady) return
    setGenerating(true)
    try {
      const res = await api.post("/interview/feedback/generate", { interviewId: interview.id })
      setFeedback(res.data.feedback)
      toast.success("AI Feedback generated!")
    } catch (err: any) {
      toast.error(err.response?.data?.Message || "Failed to generate feedback")
    } finally {
      setGenerating(false)
    }
  }

  const handleLoadExisting = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/interview/feedback/${interview.id}`)
      if (res.data.feedback) {
        setFeedback(res.data.feedback)
      } else {
      }
    } catch {
      toast.error("Failed to load feedback")
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  return (
    <SectionCard
      icon={<CalendarDays size={13} className="text-blue-600" />}
      title="Interview Details"
      subtitle="Scheduled interview information"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
        {interview.scheduledAt && (
          <InfoRow
            icon={<CalendarDays size={13} className="text-gray-400" />}
            label="Scheduled At"
            value={formatDate(interview.scheduledAt)}
          />
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <Shield size={13} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">
              Status
            </p>
            <Badge label={interview.status} style={statusStyle} />
          </div>
        </div>
      </div>

      {/* Interview Feedback */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <MessageSquare size={11} /> Interview Feedback
        </p>

        {/* Not completed yet */}
        {!isCompleted && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-5 py-6 flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-semibold text-gray-500">Feedback not available yet</p>
            <p className="text-[11px] text-gray-400">
              Interview must be completed before generating feedback.
            </p>
          </div>
        )}

        {/* Feedback ready — show it */}
        {isCompleted && feedback && (
          <FeedbackCard feedback={feedback} interviewId={interview.id} />
        )}

        {/* Completed but no feedback yet */}
        {isCompleted && !feedback && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-5 py-6 flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 bg-white border border-blue-100 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 mb-0.5">AI Interview Feedback</p>
              <p className="text-[11px] text-gray-500 max-w-xs">
                Generate a comprehensive AI report combining Q&A answers, code submissions,
                HR notes, and task evaluation.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !isTaskReady}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700
                  text-white text-xs font-semibold rounded-xl transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Sparkles size={12} />
                  }
                  {generating ? "Generating..." : "Generate AI Feedback"}
                </button>

                {taskStatusMessage && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
                    <Info size={10} />
                    <span className="text-[10px] font-medium">{taskStatusMessage}</span>
                  </div>
                )}
              </div>

              {!loaded && (
                <button
                  onClick={handleLoadExisting}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200
                  hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-colors"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  Load Existing
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}