// src/Pages/InterviewRoom/components/SuspendedScreen.tsx

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldX } from "lucide-react"
import { Logo } from "../../HR/Components/Icons"
import { api } from "../../Api/Axios"
import { useAuth } from "../../Context/AuthContext"


// ─── Component ────────────────────────────────────────────────────────────────

export default function SuspendedScreen() {
  const navigate    = useNavigate()
  const [count, setCount] = useState(10)
const {clearAuth}= useAuth()
  useEffect(() => {
    // Auto logout after countdown
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer)

          // Clear cookie by calling logout API
          api.post("/dev/logout").catch(() => {}).finally(() => {
            clearAuth()
            navigate("/devLogin")
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="fixed inset-0 bg-gray-950 z-[200] flex items-center
    justify-center font-sans antialiased">
      <div className="text-center max-w-md px-6">

        {/* Icon with pulse ring */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-red-500/10 rounded-3xl
          animate-ping opacity-40" />
          <div className="relative w-24 h-24 bg-red-500/10 border-2
          border-red-500/20 rounded-3xl flex items-center justify-center">
            <ShieldX size={40} className="text-red-500" />
          </div>
        </div>

        {/* Logo */}
        <Logo className="justify-center mb-6" />

        {/* Title */}
        <h1 className="text-2xl font-black text-white mb-3">
          Interview Suspended
        </h1>

        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          Your interview has been suspended due to multiple malpractice
          violations. HR has been notified. Please contact your HR
          directly if you believe this was an error.
        </p>

        {/* What was detected */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl
        px-5 py-4 mb-8 text-left">
          <p className="text-[11px] font-bold text-red-400 uppercase
          tracking-wider mb-3">
            Violations Detected
          </p>
          <ul className="space-y-2">
            {[
              "Suspicious browser activity",
              "Multiple malpractice warnings issued",
              "Monitoring policy violations",
            ].map((v, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs text-red-300/70">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 shrink-0" />
                {v}
              </li>
            ))}
          </ul>
        </div>

        {/* Countdown */}
        <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
          <p className="text-xs text-gray-500 mb-1">
            Logging you out in
          </p>
          <div className="text-3xl font-black text-white">{count}</div>
          <p className="text-xs text-gray-500 mt-1">seconds</p>
        </div>

        <p className="text-[10px] text-gray-600 mt-4">
          You will not be able to log in again after this session ends.
        </p>
      </div>
    </div>
  )
}