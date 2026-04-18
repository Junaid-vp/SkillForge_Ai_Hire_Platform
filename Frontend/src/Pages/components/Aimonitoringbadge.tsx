// src/Pages/InterviewRoom/components/AIMonitoringBadge.tsx

import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react"

interface Props {
  warningCount:    number
  interviewStarted: boolean // detection only active when interview STARTED
}

// ─── Config per warning level ─────────────────────────────────────────────────

const getConfig = (count: number) => {
  if (count >= 7) return {
    icon:    <ShieldX size={13} className="text-red-500" />,
    label:   "Final Warning — One more violation will suspend interview",
    bg:      "bg-red-50 border-red-300",
    text:    "text-red-700",
    dot:     "bg-red-500",
    animate: true,
  }
  if (count >= 5) return {
    icon:    <ShieldAlert size={13} className="text-orange-500" />,
    label:   "Warning 2 of 3 — Suspicious activity detected",
    bg:      "bg-orange-50 border-orange-200",
    text:    "text-orange-700",
    dot:     "bg-orange-500",
    animate: true,
  }
  if (count >= 3) return {
    icon:    <ShieldAlert size={13} className="text-yellow-600" />,
    label:   "Warning 1 of 3 — Your activity is being monitored",
    bg:      "bg-yellow-50 border-yellow-200",
    text:    "text-yellow-700",
    dot:     "bg-yellow-500",
    animate: false,
  }
  return {
    icon:    <ShieldCheck size={13} className="text-green-600" />,
    label:   "AI Monitoring Active — Your session is being recorded",
    bg:      "bg-green-50 border-green-200",
    text:    "text-green-700",
    dot:     "bg-green-500",
    animate: false,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIMonitoringBadge({ warningCount, interviewStarted }: Props) {
  // Don't show before interview starts
  if (!interviewStarted) return null

  const cfg = getConfig(warningCount)

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border
      shadow-sm backdrop-blur-sm ${cfg.bg}`}>

        {/* Animated pulsing dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          {cfg.animate && (
            <span className={`animate-ping absolute inline-flex h-full w-full
            rounded-full opacity-75 ${cfg.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
        </span>

        {cfg.icon}

        <span className={`text-[11px] font-semibold ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  )
}