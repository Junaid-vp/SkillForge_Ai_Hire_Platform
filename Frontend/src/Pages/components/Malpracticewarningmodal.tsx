// src/Pages/InterviewRoom/components/MalpracticeWarningModal.tsx

import { AlertTriangle, ShieldAlert, ShieldX } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WarningLevel = 1 | 2 | 3  // 1=first, 2=second, 3=final

interface Props {
  level:   WarningLevel
  isHR:    boolean
  onClose: () => void
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  1: {
    icon:     <AlertTriangle size={26} className="text-yellow-500" />,
    iconBg:   "bg-yellow-100",
    border:   "border-yellow-300",
    bar:      "bg-yellow-400",
    barW:     "33%",
    btn:      "bg-yellow-500 hover:bg-yellow-600",
    hrTitle:  "Warning Issued to Developer",
    devTitle: "Warning 1 of 3",
    hrMsg:    "Developer has received their first warning for suspicious activity. Two more violations will suspend the interview.",
    devMsg:   "Suspicious activity was detected. Please focus on the interview. Two more violations will result in interview suspension.",
  },
  2: {
    icon:     <ShieldAlert size={26} className="text-orange-500" />,
    iconBg:   "bg-orange-100",
    border:   "border-orange-300",
    bar:      "bg-orange-500",
    barW:     "66%",
    btn:      "bg-orange-500 hover:bg-orange-600",
    hrTitle:  "Second Warning Issued",
    devTitle: "Warning 2 of 3",
    hrMsg:    "Developer has received their second warning. One more violation will automatically trigger interview suspension.",
    devMsg:   "This is your second warning. Continued suspicious activity will result in your interview being suspended immediately.",
  },
  3: {
    icon:     <ShieldX size={26} className="text-red-500" />,
    iconBg:   "bg-red-100",
    border:   "border-red-300",
    bar:      "bg-red-500",
    barW:     "95%",
    btn:      "bg-red-500 hover:bg-red-600",
    hrTitle:  "Final Warning Issued",
    devTitle: "Final Warning",
    hrMsg:    "Developer has received their final warning. The next violation will you can suspend the interview. The suspend button is now available.",
    devMsg:   "This is your FINAL warning. The next suspicious activity detected will immediately suspend this interview and notify HR.",
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MalpracticeWarningModal({ level, isHR, onClose }: Props) {
  const cfg = CONFIG[level]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]
    flex items-center justify-center p-4">
      <div className={`bg-white border-2 ${cfg.border} rounded-2xl shadow-2xl
      w-full max-w-sm overflow-hidden`}>

        {/* Progress bar at top */}
        <div className="h-1.5 bg-gray-100 w-full">
          <div
            className={`h-full ${cfg.bar} transition-all duration-700`}
            style={{ width: cfg.barW }}
          />
        </div>

        <div className="p-6 text-center">

          {/* Icon */}
          <div className={`w-14 h-14 ${cfg.iconBg} rounded-2xl flex items-center
          justify-center mx-auto mb-4`}>
            {cfg.icon}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {isHR ? cfg.hrTitle : cfg.devTitle}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            {isHR ? cfg.hrMsg : cfg.devMsg}
          </p>

          {/* Warning count pills */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= level ? cfg.bar : "bg-gray-200"
                }`}
                style={{ width: i <= level ? "2.5rem" : "1.5rem" }}
              />
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mb-5">
            {level < 3
              ? `${level} of 3 warnings — ${3 - level} more will suspend interview`
              : "Next violation will suspend the interview"
            }
          </p>

          <button
            onClick={onClose}
            className={`w-full py-2.5 ${cfg.btn} text-white text-sm
            font-semibold rounded-xl transition-colors`}
          >
            {isHR ? "Acknowledged" : "I Understand"}
          </button>
        </div>
      </div>
    </div>
  )
}