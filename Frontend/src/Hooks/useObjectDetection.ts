// src/Hooks/useObjectDetection.ts
// HARD: Phone, Extra device (laptop/tablet), Extra person
// SOFT: Book/notes
// No toasts — all goes to bell notification only
// Only active when interviewStarted = true

import { useEffect, useRef } from "react"
import { ObjectDetector, FilesetResolver } from "@mediapipe/tasks-vision"
import { getSocket } from "../Service/socket"

export function useObjectDetection(
  interviewId:      string | undefined,
  videoRef:         React.RefObject<HTMLVideoElement | null>,
  isActive:         boolean,
  interviewStarted: boolean  // only detect when both joined
) {
  const detectorRef   = useRef<ObjectDetector | null>(null)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const isLoaded      = useRef(false)
  const lastAlertTime = useRef<Record<string, number>>({})

  const canAlert = (type: string, cooldownMs = 10000): boolean => {
    const now  = Date.now()
    const last = lastAlertTime.current[type] ?? 0
    if (now - last < cooldownMs) return false
    lastAlertTime.current[type] = now
    return true
  }

  // ── Load MediaPipe Object Detector ─────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    const load = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        )
        detectorRef.current = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "GPU",
          },
          runningMode:    "VIDEO",
          scoreThreshold: 0.6,  // Higher threshold = fewer false positives
          maxResults:     10,
        })
        isLoaded.current = true
        // MediaPipe Object Detector loaded
      } catch (e) {
        // MediaPipe Object Detector load failed silently
      }
    }

    load()
    return () => { detectorRef.current?.close() }
  }, [isActive])

  // ── Detection loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    // ✅ Only start when interview STARTED
    if (!isActive || !interviewId || !interviewStarted) return

    const socket = getSocket()

    // HARD violation — counts toward warning threshold
    const emitHard = (type: string, message: string) => {
      if (!canAlert(type, 10000)) return
      socket.emit("malpractice-hard", {
        interviewId, type, message,
        severity:  "HIGH",
        timestamp: new Date().toISOString(),
      })
    }

    // SOFT violation — only bell log
    const emitSoft = (type: string, message: string) => {
      if (!canAlert(type, 15000)) return
      socket.emit("malpractice-soft", {
        interviewId, type, message,
        severity:  "MEDIUM",
        timestamp: new Date().toISOString(),
      })
    }

    intervalRef.current = setInterval(() => {
      if (!isLoaded.current || !detectorRef.current) return

      const video = videoRef.current
      if (!video || video.readyState !== 4) return

      try {
        const result = detectorRef.current.detectForVideo(video, performance.now())

        result.detections.forEach(detection => {
          const label = detection.categories[0]?.categoryName ?? ""
          const score = detection.categories[0]?.score         ?? 0

          // ── HARD: Phone ──────────────────────────────────────────────
          if (label === "cell phone" && score > 0.6) {
            emitHard("PHONE_DETECTED", "Phone detected in camera frame")
          }

          // ── HARD: Extra device ───────────────────────────────────────
          if ((label === "laptop" || label === "tablet") && score > 0.6) {
            emitHard("EXTRA_DEVICE", "Extra device detected — possible cheating tool")
          }

          // ── HARD: Extra person ───────────────────────────────────────
          if (label === "person" && score > 0.65) {
            emitHard("EXTRA_PERSON", "Additional person detected near developer")
          }

          // ── SOFT: Book / notes ───────────────────────────────────────
          if (label === "book" && score > 0.6) {
            emitSoft("BOOK_DETECTED", "Book or reference material detected")
          }
        })
      } catch {
        // Silent
      }
    }, 2000) // 2s interval for object detection

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, interviewId, interviewStarted])
}