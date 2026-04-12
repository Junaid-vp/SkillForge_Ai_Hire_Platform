
import { useEffect, useRef } from "react"
import { getSocket } from "../Service/socket"
import toast from "react-hot-toast"

export function useBrowserMalpractice(
  interviewId: string | undefined,
  isActive:    boolean  // pass !isHR from the component
) {
  const lastAlertTime = useRef<Record<string, number>>({})

  const canAlert = (type: string, cooldownMs: number): boolean => {
    const now  = Date.now()
    const last = lastAlertTime.current[type] ?? 0
    if (now - last < cooldownMs) return false
    lastAlertTime.current[type] = now
    return true
  }

  useEffect(() => {
    if (!isActive || !interviewId) return

    const socket = getSocket()

    const emit = (
      type:      string,
      message:   string,
      severity:  "LOW" | "MEDIUM" | "HIGH",
      cooldownMs: number
    ) => {
      if (!canAlert(type, cooldownMs)) return

      socket.emit("malpractice", {
        interviewId,
        type,
        message,
        severity,
        timestamp: new Date().toISOString(),
      })

      if (severity === "HIGH") {
        toast(`🚨 ${message}`, {
          id: type,
          style: {
            background: "#fef2f2",
            color:      "#991b1b",
            border:     "1px solid #fecaca",
          },
          duration: 5000,
        })
      } else if (severity === "MEDIUM") {
        toast(`⚠️ ${message}`, {
          id: type,
          style: {
            background: "#fffbeb",
            color:      "#92400e",
            border:     "1px solid #fde68a",
          },
          duration: 4000,
        })
      } else {
        toast(`⚠️ ${message}`, {
          id: type,
          style: {
            background: "#fffbeb",
            color:      "#92400e",
            border:     "1px solid #fde68a",
          },
          duration: 3000,
        })
      }
    }

    // ── 1. Tab switch ─────────────────────────────────────────────────────
    // Cooldown: 5s — user can rapidly alt-tab, only alert once
    const handleVisibilityChange = () => {
      if (!document.hidden) return
      emit("TAB_SWITCH", "Developer switched to another tab", "HIGH", 5000)
    }

    // ── 2. Window blur ─────────────────────────────────────────────────────
    // Cooldown: 5s — blur fires frequently (e.g. clicking other app)
    const handleWindowBlur = () => {
      emit("WINDOW_BLUR", "Developer left the interview window", "MEDIUM", 5000)
    }

    // ── 3. Copy attempt ────────────────────────────────────────────────────
    // Cooldown: 3s — each copy is meaningful, shorter window
    const handleCopy = () => {
      emit("COPY_ATTEMPT", "Developer attempted to copy content", "LOW", 3000)
    }

    // ── 4. Right-click attempt ─────────────────────────────────────────────
    // Cooldown: 3s — right-clicks can spam fast
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      emit("RIGHT_CLICK", "Developer attempted right click", "LOW", 3000)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur",               handleWindowBlur)
    document.addEventListener("copy",             handleCopy)
    document.addEventListener("contextmenu",      handleContextMenu)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur",               handleWindowBlur)
      document.removeEventListener("copy",             handleCopy)
      document.removeEventListener("contextmenu",      handleContextMenu)
    }
  }, [isActive, interviewId])
}