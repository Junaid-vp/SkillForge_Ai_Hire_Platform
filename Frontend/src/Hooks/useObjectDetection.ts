import { useEffect, useRef } from "react"
import {
  ObjectDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision"
import { getSocket } from "../Service/socket"
import toast from "react-hot-toast"

export function useObjectDetection(
  interviewId: string | undefined,
  videoRef:     React.RefObject<HTMLVideoElement | null>,
  isActive:    boolean
) {
  const detectorRef = useRef<ObjectDetector | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isLoaded    = useRef(false)

  // ── Cooldown ──────────────────────────
  const lastAlertTime = useRef<Record<string, number>>({})

  const canAlert = (type: string, cooldownMs = 10000): boolean => {
    const now  = Date.now()
    const last = lastAlertTime.current[type] ?? 0
    if (now - last < cooldownMs) return false
    lastAlertTime.current[type] = now
    return true
  }

  // ── Load MediaPipe Object Detector ────
  useEffect(() => {
    if (!isActive) return

    const load = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        )

        detectorRef.current = await ObjectDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
              delegate: "GPU"
            },
            runningMode:         "VIDEO",
            scoreThreshold:      0.5,
            maxResults:          10,
          }
        )

        isLoaded.current = true
        console.log("✅ MediaPipe Object Detector loaded")
      } catch (e) {
        console.error("❌ MediaPipe Object Detector failed:", e)
      }
    }

    load()

    return () => {
      detectorRef.current?.close()
    }
  }, [isActive])

  // ── Detection loop ────────────────────
  useEffect(() => {
    if (!isActive || !interviewId) return

    const socket = getSocket()

    const emit = (
      type:     string,
      message:  string,
      severity: "LOW" | "MEDIUM" | "HIGH"
    ) => {
      if (!canAlert(type)) return

      socket.emit("malpractice", {
        interviewId,
        type,
        message,
        severity,
        timestamp: new Date().toISOString()
      })

      if (severity === "HIGH") {
        toast(`🚨 ${message}`, {
          style: {
            background: "#fef2f2",
            color:      "#991b1b",
            border:     "1px solid #fecaca",
          },
          duration: 5000
        })
      } else if (severity === "MEDIUM") {
        toast(`⚠️ ${message}`, {
          style: {
            background: "#fffbeb",
            color:      "#92400e",
            border:     "1px solid #fde68a",
          },
          duration: 4000
        })
      }
    }

    // ── Run every 2 seconds ───────────
    // MediaPipe is fast enough for 2s
    intervalRef.current = setInterval(() => {
      if (!isLoaded.current || !detectorRef.current) return

      const video = videoRef.current
      if (!video || video.readyState !== 4) return

      try {
        const result = detectorRef.current
          .detectForVideo(video, performance.now())

        result.detections.forEach((detection) => {
          const label = detection.categories[0]?.categoryName ?? ""
          const score = detection.categories[0]?.score ?? 0

          // ── Phone detected ──────────
          if (
            label === "cell phone" &&
            score > 0.5
          ) {
            emit(
              "PHONE_DETECTED",
              "Phone detected in camera frame",
              "HIGH"
            )
          }

          // ── Book / notes ─────────────
          if (
            label === "book" &&
            score > 0.5
          ) {
            emit(
              "BOOK_DETECTED",
              "Book or reference material detected",
              "MEDIUM"
            )
          }

          // ── Extra laptop / tablet ────
          if (
            (label === "laptop" || label === "tablet") &&
            score > 0.5
          ) {
            emit(
              "EXTRA_DEVICE",
              "Extra device detected — possible cheating tool",
              "HIGH"
            )
          }

          // ── Extra person ─────────────
          if (
            label === "person" &&
            score > 0.6
          ) {
            emit(
              "EXTRA_PERSON",
              "Additional person detected near developer",
              "HIGH"
            )
          }

        })
      } catch {
        // silent
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, interviewId])
}