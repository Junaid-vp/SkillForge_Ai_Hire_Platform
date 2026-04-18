// src/Pages/InterviewRoom/components/MalpracticeNotificationBell.tsx

import { useState, useEffect, useRef } from "react"
import { Bell, ShieldAlert, X } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MalpracticeLog {
  type:      string
  message:   string
  severity:  "LOW" | "MEDIUM" | "HIGH"
  timestamp: string
  isHard:    boolean  // true = counts toward warnings
}

interface Props {
  logs:         MalpracticeLog[]
  warningCount: number   // hard violations count
  isHR:         boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityStyle = (severity: string, isHard: boolean) => {
  if (isHard && severity === "HIGH")
    return { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200"    }
  if (severity === "MEDIUM")
    return { dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" }
  return   { dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-500 border-gray-200"  }
}

const formatTime = (ts: string) => {
  const d    = new Date(ts)
  const h    = d.getHours()
  const m    = String(d.getMinutes()).padStart(2, "0")
  const s    = String(d.getSeconds()).padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${m}:${s} ${ampm}`
}

// Friendly display name
const typeLabel = (type: string) =>
  type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

// ─── Component ────────────────────────────────────────────────────────────────

export default function MalpracticeNotificationBell({ logs, warningCount, isHR }: Props) {
  const [isOpen,    setIsOpen]    = useState(false)
  const [newCount,  setNewCount]  = useState(0)
  const prevLen = useRef(0)
  const dropRef = useRef<HTMLDivElement>(null)

  // Badge count increases on new logs
  useEffect(() => {
    if (logs.length > prevLen.current) {
      setNewCount(c => c + (logs.length - prevLen.current))
    }
    prevLen.current = logs.length
  }, [logs.length])

  // Clear badge when opened
  useEffect(() => {
    if (isOpen) setNewCount(0)
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Bell color based on warning count
  const bellColor =
    warningCount >= 7 ? "text-red-500"
    : warningCount >= 5 ? "text-orange-500"
    : warningCount >= 3 ? "text-yellow-500"
    : "text-gray-500"

  const bellBg =
    warningCount >= 7 ? "bg-red-50 border-red-200 hover:bg-red-100"
    : warningCount >= 5 ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
    : warningCount >= 3 ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
    : "bg-gray-50 border-gray-200 hover:bg-gray-100"

  return (
    <div className="relative" ref={dropRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${bellBg}`}
        title={isHR ? "Malpractice Log" : "AI Monitoring Log"}
      >
        {warningCount > 0
          ? <ShieldAlert size={16} className={bellColor} />
          : <Bell       size={16} className={bellColor} />
        }

        {/* Unread badge */}
        {newCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500
          text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
            {newCount > 9 ? "9+" : newCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100
        rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
          border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <ShieldAlert size={13} className={bellColor} />
              <span className="text-xs font-bold text-gray-800">
                {isHR ? "Malpractice Log" : "AI Monitoring Log"}
              </span>
              {warningCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600
                border border-red-200 px-1.5 py-0.5 rounded-full">
                  {warningCount} hard violation{warningCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {/* Log list */}
          <div className="max-h-72 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No suspicious activity detected</p>
              </div>
            ) : (
              // Show newest first
              [...logs].reverse().map((log, i) => {
                const style = severityStyle(log.severity, log.isHard)
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-2.5
                    border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Severity dot */}
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${style.dot}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${style.badge}`}>
                          {typeLabel(log.type)}
                        </span>
                        {log.isHard && (
                          <span className="text-[9px] font-bold text-red-500">
                            +1 violation
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {log.message}
                      </p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {formatTime(log.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer summary */}
          {logs.length > 0 && (
            <div className="px-4 py-2.5 bg-gray-50/60 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">
                {logs.length} event{logs.length !== 1 ? "s" : ""} detected
                {warningCount > 0 && ` · ${warningCount} hard violation${warningCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}