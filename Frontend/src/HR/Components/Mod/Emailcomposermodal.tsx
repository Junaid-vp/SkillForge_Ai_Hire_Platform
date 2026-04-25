import { useState, useEffect } from "react"
import { X, Send, Loader2, FileText, Mail, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "../../../Api/Axios"
import { generateReportPDFBase64 } from "../../Utils/generateReportPDF"

export type EmailType = "EVALUATED" | "SUSPENDED" | "CANCELLED"

interface Props {
  isOpen:         boolean
  onClose:        () => void
  interviewId:    string
  developerName:  string
  developerEmail: string
  position:       string
  emailType:      EmailType
  hasPdf:         boolean
}

const SUBJECTS: Record<EmailType, string> = {
  EVALUATED: "Interview Evaluation Report",
  SUSPENDED: "Interview Status Update — Action Required",
  CANCELLED: "Interview Cancellation Notice",
}

const BODY_TEMPLATES: Record<EmailType, (name: string, position: string) => string> = {
  EVALUATED: (name, position) =>
    `Dear ${name},\n\nThank you for completing your technical interview for the ${position} position.\n\nPlease find attached your detailed evaluation report.\n\nWe will be in touch with the next steps shortly.\n\nBest regards,`,
  SUSPENDED: (name, _) =>
    `Dear ${name},\n\nWe are writing to inform you that your interview session has been flagged by our AI proctoring system for suspicious activity.\n\nAs a result, your session has been suspended.\n\nIf you believe this was an error, please contact us directly.\n\nBest regards,`,
  CANCELLED: (name, position) =>
    `Dear ${name},\n\nWe regret to inform you that your scheduled interview for the ${position} position has been cancelled.\n\nWe apologize for any inconvenience and will reach out to reschedule at a suitable time.\n\nBest regards,`,
}

const TYPE_CONFIG: Record<EmailType, { label: string; color: string; bg: string; border: string; btnColor: string }> = {
  EVALUATED: { label: "Send Evaluation Report",  color: "text-blue-700", bg: "bg-blue-50",  border: "border-blue-100",  btnColor: "bg-blue-600 hover:bg-blue-700"  },
  SUSPENDED: { label: "Send Suspension Notice",  color: "text-red-700",  bg: "bg-red-50",   border: "border-red-100",   btnColor: "bg-red-600 hover:bg-red-700"    },
  CANCELLED: { label: "Send Cancellation Email", color: "text-gray-700", bg: "bg-gray-50",  border: "border-gray-200",  btnColor: "bg-gray-700 hover:bg-gray-800"  },
}

export default function EmailComposerModal({
  isOpen, onClose, interviewId,
  developerName, developerEmail, position,
  emailType, hasPdf,
}: Props) {
  const queryClient = useQueryClient()
  const cfg = TYPE_CONFIG[emailType]
  const [subject, setSubject] = useState(SUBJECTS[emailType])
  const [body,    setBody]    = useState(BODY_TEMPLATES[emailType](developerName, position))
  const [sending, setSending] = useState(false)
  const [pdfBase64, setPdfBase64] = useState<string | undefined>(undefined)
  const [pdfFileName, setPdfFileName] = useState<string | undefined>(undefined)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (isOpen && emailType === "EVALUATED" && hasPdf) {
      generateAttachment()
    }
  }, [isOpen])

  const generateAttachment = async () => {
    setGenerating(true)
    try {
      const res = await api.get(`/report/interview/${interviewId}`)
      const { base64, fileName } = await generateReportPDFBase64(res.data.data)
      setPdfBase64(base64)
      setPdfFileName(fileName)
    } catch (e) {
      // PDF generation error handled by toast
      toast.error("Failed to prepare PDF attachment")
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and message required"); return }
    setSending(true)
    try {
      await api.post("/report/send-email", {
        to:        developerEmail,
        interviewId,
        subject,
        message:     body,
        pdfBase64:   emailType === "EVALUATED" ? pdfBase64 : undefined,
        pdfFileName: emailType === "EVALUATED" ? pdfFileName : undefined,
      })
      toast.success(`Email sent to ${developerEmail}!`)
      queryClient.invalidateQueries({ queryKey: ["reportInterviews"] })
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.Message ?? "Failed to send email")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${cfg.border} ${cfg.bg}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Mail size={15} className={cfg.color} />
            </div>
            <div>
              <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-[11px] text-gray-400">To: {developerEmail}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={sending} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {emailType === "EVALUATED" && hasPdf && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              {generating ? (
                <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
              ) : (
                <FileText size={14} className="text-blue-500 shrink-0" />
              )}
              <div>
                <p className="text-xs font-semibold text-blue-700">
                  {generating ? "Preparing PDF Report..." : "PDF Report Auto-Attached"}
                </p>
                <p className="text-[11px] text-blue-500">
                  {generating ? "Fetching interview details..." : (pdfFileName ?? "Preparing...")}
                </p>
              </div>
            </div>
          )}

          {emailType === "EVALUATED" && !hasPdf && (
            <div className="px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-[11px] text-yellow-700">
              <p className="text-[11px] text-amber-600 flex items-center gap-1.5 justify-center">
                <AlertTriangle size={12} /> Generate AI feedback first to include the PDF report.
              </p>
              </p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200
              rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-1
              focus:ring-blue-100 transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Message
              <span className="text-gray-400 font-normal ml-1">— write anything you want</span>
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200
              rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-1
              focus:ring-blue-100 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">To</p>
              <p className="text-xs font-medium text-gray-700 truncate">{developerEmail}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">From</p>
              <p className="text-xs font-medium text-gray-700">SkillForge AI</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border
            border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || generating || !subject.trim() || !body.trim()}
            className={`flex-1 flex items-center justify-center gap-2 text-white
            text-xs font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 ${cfg.btnColor}`}
          >
            {sending
              ? <><Loader2 size={13} className="animate-spin" /> Sending...</>
              : <><Send size={13} /> Send Email</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}