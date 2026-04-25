// src/HR/Pages/ReportPage.tsx
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  FileText, Mail, Download, Loader2, AlertCircle,
  CheckCircle2, XCircle, ShieldX, Search,
  ChevronRight, BarChart2, Calendar, User, Briefcase,
} from "lucide-react"
import { api } from "../../Api/Axios"
import EmailComposerModal from "../Components/Mod/Emailcomposermodal"
import { generateReportPDF } from "../Utils/generateReportPDF"


// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportInterview {
  id:          string
  status:      "COMPLETED" | "CANCELLED" | "SUSPENDED"
  scheduledAt: string | null
  createdAt:   string
  reportSent:  boolean
  feedback:    any
  developer: {
    id:             string
    developerName:  string
    developerEmail: string
    position:       string
    experience:     number
    skills:         string | null
    aiSummary:      string | null
  }
  task: {
    status:      string
    aiScore:     number | null
    aiReport:    any
    submittedAt: string | null
  } | null
  _count: { answers: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  COMPLETED: {
    label:  "Completed",
    icon:   <CheckCircle2 size={11} />,
    bg:     "bg-green-50",
    border: "border-green-200",
    text:   "text-green-700",
  },
  CANCELLED: {
    label:  "Cancelled",
    icon:   <XCircle size={11} />,
    bg:     "bg-gray-50",
    border: "border-gray-200",
    text:   "text-gray-500",
  },
  SUSPENDED: {
    label:  "Suspended",
    icon:   <ShieldX size={11} />,
    bg:     "bg-red-50",
    border: "border-red-200",
    text:   "text-red-600",
  },
}

const RECOMMENDATION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  HIRE:     { label: "Hire",     color: "text-green-700",  bg: "bg-green-100"  },
  MAYBE:    { label: "Maybe",    color: "text-yellow-700", bg: "bg-yellow-100" },
  NO_HIRE:  { label: "No Hire",  color: "text-red-700",    bg: "bg-red-100"    },
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

// Is this interview "report-ready" (task evaluated)?
const isEvaluated = (interview: ReportInterview) =>
  interview.status === "COMPLETED" &&
  interview.task?.status === "EVALUATED" &&
  interview.feedback != null

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const navigate = useNavigate()
  const [search,        setSearch]        = useState("")
  const [filterStatus,  setFilterStatus]  = useState<string>("ALL")
  const [emailModal,    setEmailModal]    = useState<ReportInterview | null>(null)

  const { data, isLoading, isError } = useQuery<ReportInterview[]>({
    queryKey:  ["reportInterviews"],
    queryFn:   async () => {
      const res = await api.get("/report/interviews")
      return res.data.data
    },
  })

  // Filter
  const filtered = (data ?? []).filter(iv => {
    const matchSearch = iv.developer.developerName
      .toLowerCase().includes(search.toLowerCase()) ||
      iv.developer.position.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "ALL" || iv.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <BarChart2 size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            Reports
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Interview Reports
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          View evaluations and send reports to candidates
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or position..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200
            rounded-xl outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 text-gray-800"
          />
        </div>

        {/* Status filter */}
        {["ALL", "COMPLETED", "SUSPENDED", "CANCELLED"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 text-[11px] font-semibold rounded-xl border transition-colors ${
              filterStatus === s
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-40" />
                  <div className="h-2 bg-gray-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-white border border-red-100 rounded-2xl p-10 text-center">
          <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-500">Failed to load reports</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-600">No reports yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Completed, suspended, or cancelled interviews will appear here
          </p>
        </div>
      )}

      {/* Interview list */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(interview => {
            const cfg        = STATUS_CONFIG[interview.status]
            const evaluated  = isEvaluated(interview)
            const feedback   = interview.feedback as any
            const rec        = feedback?.recommendation
              ? RECOMMENDATION_CONFIG[feedback.recommendation]
              : null

            return (
              <div
                key={interview.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm
                overflow-hidden hover:border-gray-200 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center
                    justify-center text-white text-sm font-bold shrink-0">
                      {interview.developer.developerName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {interview.developer.developerName}
                        </h3>

                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold
                        px-2 py-0.5 rounded-full border uppercase tracking-wide
                        ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          {cfg.icon} {cfg.label}
                        </span>

                        {/* Recommendation badge (evaluated only) */}
                        {evaluated && rec && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full
                          ${rec.bg} ${rec.color}`}>
                            {rec.label}
                          </span>
                        )}

                        {/* Sent badge */}
                        {interview.reportSent && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold
                          px-2 py-0.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600
                          uppercase tracking-wide">
                            <Mail size={9} /> Sent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase size={10} /> {interview.developer.position}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={10} /> {interview.developer.experience}yr exp
                        </span>
                        {interview.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {formatDate(interview.scheduledAt)}
                          </span>
                        )}
                        {evaluated && feedback?.overallScore && (
                          <span className={`font-bold text-xs ${
                            feedback.overallScore >= 8 ? "text-green-600"
                            : feedback.overallScore >= 5 ? "text-yellow-600"
                            : "text-red-500"
                          }`}>
                            Score: {feedback.overallScore}/10
                          </span>
                        )}
                      </div>

                      {/* Task status info */}
                      {interview.status === "COMPLETED" && !evaluated && (
                        <div className="mt-2">
                          <span className="text-[10px] text-gray-400 bg-gray-50
                          border border-gray-100 px-2 py-0.5 rounded-full">
                            {!interview.task
                              ? "No task assigned"
                              : interview.task.status === "PENDING"
                              ? "Task pending submission"
                              : interview.task.status === "SUBMITTED"
                              ? "AI evaluating task..."
                              : !interview.feedback
                              ? "Feedback not generated yet"
                              : "Processing..."
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">

                      {/* View full details */}
                      <button
                        onClick={() => navigate(`/dashboard/devFullDetails/${interview.developer.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50
                        hover:bg-gray-100 border border-gray-200 text-gray-600
                        text-[11px] font-semibold rounded-xl transition-colors"
                      >
                        View <ChevronRight size={11} />
                      </button>

                      {/* PDF download (evaluated only) */}
                      {evaluated && (
                        <PDFDownloadButton interview={interview} />
                      )}

                      {/* Send email button */}
                      <button
                        onClick={() => setEmailModal(interview)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px]
                        font-semibold rounded-xl transition-colors ${
                          evaluated
                         ? "bg-blue-600 hover:bg-blue-700 text-white"
                         : "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600"
                        } ${interview.reportSent ? "opacity-80" : ""}`}
                      >
                        <Mail size={11} />
                        {interview.reportSent 
                          ? "Resend Report"
                          : interview.status === "SUSPENDED" ? "Send Suspension Email"
                          : interview.status === "CANCELLED" ? "Send Cancellation Email"
                          : "Send Report Email"
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Email composer modal */}
      {emailModal && (
        <EmailComposerModal
          isOpen={!!emailModal}
          onClose={() => setEmailModal(null)}
          interviewId={emailModal.id}
          developerName={emailModal.developer.developerName}
          developerEmail={emailModal.developer.developerEmail}
          position={emailModal.developer.position}
          emailType={
            emailModal.status === "SUSPENDED" ? "SUSPENDED" :
            emailModal.status === "CANCELLED" ? "CANCELLED" : "EVALUATED"
          }
          hasPdf={isEvaluated(emailModal)}
        />
      )}
    </div>
  )
}

// ─── PDF Download Button ──────────────────────────────────────────────────────

function PDFDownloadButton({ interview }: { interview: ReportInterview }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/report/interview/${interview.id}`)
      const fullData = res.data.data

      await generateReportPDF(fullData)
    } catch (e) {
      // PDF error handled by toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50
      hover:bg-green-100 border border-green-200 text-green-700
      text-[11px] font-semibold rounded-xl transition-colors disabled:opacity-60"
    >
      {loading
        ? <Loader2 size={11} className="animate-spin" />
        : <Download size={11} />
      }
      PDF
    </button>
  )
}