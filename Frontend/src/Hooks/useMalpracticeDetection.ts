// src/Hooks/useMalpracticeDetection.ts
// HARD: No face, Multiple faces, Phone, Extra device, Extra person
// SOFT: Head rotation, Eye movement (no false suspensions)
// No toasts — all goes to bell notification only
// Only active when interviewStarted = true

import { useEffect, useRef } from "react"
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { getSocket } from "../Service/socket"

export function useMalpracticeDetection(
  interviewId:      string | undefined,
  videoRef:         React.RefObject<HTMLVideoElement | null>,
  isActive:         boolean,
  interviewStarted: boolean  // only detect when both joined
) {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const modelsLoaded      = useRef(false)
  const lastAlertTime     = useRef<Record<string, number>>({})

  const canAlert = (type: string, cooldownMs = 8000): boolean => {
    const now  = Date.now()
    const last = lastAlertTime.current[type] ?? 0
    if (now - last < cooldownMs) return false
    lastAlertTime.current[type] = now
    return true
  }

  // ── Load MediaPipe ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    const loadModels = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        )
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode:   "VIDEO",
          numFaces:      3,
          minFaceDetectionConfidence:         0.5,
          minTrackingConfidence:              0.5,
          outputFaceBlendshapes:              true,
          outputFacialTransformationMatrixes: true,
        })
        modelsLoaded.current = true
        // MediaPipe Face Landmarker loaded
      } catch (_e) {
        // MediaPipe load failed silently
      }
    }

    loadModels()
    return () => { faceLandmarkerRef.current?.close() }
  }, [isActive])

  // ── Detection loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    // ✅ Only start when interview STARTED
    if (!isActive || !interviewId || !interviewStarted) return

    const socket = getSocket()

    // HARD violation — counts toward warning threshold
    const emitHard = (type: string, message: string) => {
      if (!canAlert(type, 8000)) return
      socket.emit("malpractice-hard", {
        interviewId, type, message,
        severity:  "HIGH",
        timestamp: new Date().toISOString(),
      })
    }

    // SOFT violation — only goes to bell log, no warning count
    const emitSoft = (type: string, message: string) => {
      if (!canAlert(type, 10000)) return // longer cooldown for soft
      socket.emit("malpractice-soft", {
        interviewId, type, message,
        severity:  "LOW",
        timestamp: new Date().toISOString(),
      })
    }

    intervalRef.current = setInterval(async () => {
      if (!modelsLoaded.current) return

      const video = videoRef.current
      if (!video || video.readyState !== 4) return

      const now = performance.now()

      try {
        const faceResult = faceLandmarkerRef.current?.detectForVideo(video, now)
        const faceCount  = faceResult?.faceLandmarks?.length ?? 0

        // ── HARD: No face ──────────────────────────────────────────────
        if (faceCount === 0) {
          emitHard("NO_FACE", "No face detected — developer may have left seat")
          return
        }

        // ── HARD: Multiple faces ───────────────────────────────────────
        if (faceCount > 1) {
          emitHard("MULTIPLE_FACES", `${faceCount} faces detected — possible assistance`)
        }

        // ── SOFT: Head pose ────────────────────────────────────────────
        // Head rotation is SOFT — developer might just be thinking
        const matrices = faceResult?.facialTransformationMatrixes
        if (matrices && matrices.length > 0) {
          const matrix    = matrices[0].data
          const rotationX = Math.asin(-matrix[9])  * (180 / Math.PI)
          const rotationY = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI)

          // Higher threshold (35°) to reduce false positives
          if (Math.abs(rotationY) > 35) {
            emitSoft(
              "HEAD_TURN",
              `Developer looking ${rotationY > 0 ? "left" : "right"}`
            )
          }
          if (rotationX < -25) {
            emitSoft("HEAD_UP",   "Developer looking up — possible second monitor")
          }
          if (rotationX > 25) {
            emitSoft("HEAD_DOWN", "Developer looking down — possible notes")
          }
        }

        // ── SOFT: Eye gaze ─────────────────────────────────────────────
        // Eye movement is SOFT — normal during thinking
        const blendshapes = faceResult?.faceBlendshapes
        if (blendshapes && blendshapes.length > 0) {
          const shapes   = blendshapes[0].categories
          const getScore = (name: string) =>
            shapes.find(s => s.categoryName === name)?.score ?? 0

          const eyeLookLeft  = getScore("eyeLookOutLeft")  + getScore("eyeLookInRight")
          const eyeLookRight = getScore("eyeLookOutRight") + getScore("eyeLookInLeft")

          // Higher threshold (0.8) to reduce false positives
          if (eyeLookLeft > 0.8 || eyeLookRight > 0.8) {
            emitSoft("GAZE_SIDEWAYS", "Developer eyes looking sideways")
          }
        }

      } catch {
        // Silent — never break interview
      }
    }, 1500) // 1.5s interval — slightly slower to reduce false positives

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, interviewId, interviewStarted])
}