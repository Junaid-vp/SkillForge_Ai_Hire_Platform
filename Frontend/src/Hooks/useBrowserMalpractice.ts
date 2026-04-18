// src/Hooks/useBrowserMalpractice.ts
// HARD violations only — tab switch, window blur
// No toasts — goes to bell notification only
// Only active when interviewStarted = true

import { useEffect, useRef } from "react"
import { getSocket } from "../Service/socket"

export function useBrowserMalpractice(
  interviewId:      string | undefined,
  isActive:         boolean,  // pass !isHR
  interviewStarted: boolean   // only detect when both joined
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
    // ✅ Only start when interview is STARTED and user is developer
    if (!isActive || !interviewId || !interviewStarted) return

    const socket = getSocket()

    // Emit HARD violation — counts toward warning system
    const emitHard = (
      type:     string,
      message:  string,
      cooldownMs: number
    ) => {
      if (!canAlert(type, cooldownMs)) return

      socket.emit("malpractice-hard", {
        interviewId,
        type,
        message,
        severity:  "HIGH",
        timestamp: new Date().toISOString(),
      })
    }

    // ── 1. Tab switch — HARD ─────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (!document.hidden) return
      emitHard("TAB_SWITCH", "Developer switched to another tab", 5000)
    }

    // ── 2. Window blur — HARD ────────────────────────────────────────────
    // Small cooldown — blur fires when clicking other apps
    const handleWindowBlur = () => {
      emitHard("WINDOW_BLUR", "Developer left the interview window", 5000)
    }

    // ── 3. Copy attempt — log only (soft) ───────────────────────────────
    // Not a hard violation — just logged to bell
    const handleCopy = () => {
      if (!canAlert("COPY_ATTEMPT", 3000)) return
      socket.emit("malpractice-soft", {
        interviewId,
        type:      "COPY_ATTEMPT",
        message:   "Developer attempted to copy content",
        severity:  "LOW",
        timestamp: new Date().toISOString(),
      })
    }

    // ── 4. Right click — log only (soft) ────────────────────────────────
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      if (!canAlert("RIGHT_CLICK", 3000)) return
      socket.emit("malpractice-soft", {
        interviewId,
        type:      "RIGHT_CLICK",
        message:   "Developer attempted right click",
        severity:  "LOW",
        timestamp: new Date().toISOString(),
      })
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur",              handleWindowBlur)
    document.addEventListener("copy",            handleCopy)
    document.addEventListener("contextmenu",     handleContextMenu)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur",              handleWindowBlur)
      document.removeEventListener("copy",            handleCopy)
      document.removeEventListener("contextmenu",     handleContextMenu)
    }
  }, [isActive, interviewId, interviewStarted])
}