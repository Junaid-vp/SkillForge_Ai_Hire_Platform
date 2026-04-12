import { useEffect, useRef } from "react"
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision"
import { getSocket } from "../Service/socket"
import toast from "react-hot-toast"

export function useMalpracticeDetection(
  interviewId: string | undefined,
  videoRef:    React.RefObject<HTMLVideoElement | null>,
  isActive:    boolean
) {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const modelsLoaded      = useRef(false)

  // ── Cooldown to avoid spam alerts ────
  // Same alert won't fire more than once per 5 seconds
  const lastAlertTime = useRef<Record<string, number>>({})

  const canAlert = (type: string, cooldownMs = 5000): boolean => {
    const now  = Date.now()
    const last = lastAlertTime.current[type] ?? 0
    if (now - last < cooldownMs) return false
    lastAlertTime.current[type] = now
    return true
  }

  // ── Load MediaPipe models ─────────────
  useEffect(() => {
    if (!isActive) return

    const loadModels = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        )

        // ── Face Landmarker ─────────────
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU"
            },
            runningMode:         "VIDEO",
            numFaces:            3,    // detect up to 3 faces
            minFaceDetectionConfidence: 0.5,
            minTrackingConfidence:      0.5,
            outputFaceBlendshapes:      true, // for expression detection
            outputFacialTransformationMatrixes: true // for head pose
          }
        )

        modelsLoaded.current = true
        console.log("✅ MediaPipe Face Landmarker loaded")

      } catch (e) {
        console.error("MediaPipe failed to load:", e)
      }
    }

    loadModels()

    return () => {
      faceLandmarkerRef.current?.close()
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
      if (!canAlert(type)) return // cooldown check

      socket.emit("malpractice", {
        interviewId,
        type,
        message,
        severity,
        timestamp: new Date().toISOString()
      })

      if (severity === "HIGH") {
        toast(`🚨 ${message}`, {
          id: type,
          style: {
            background: "#fef2f2",
            color:      "#991b1b",
            border:     "1px solid #fecaca",
          },
          duration: 5000
        })
      } else if (severity === "MEDIUM") {
        toast(`⚠️ ${message}`, {
          id: type,
          style: {
            background: "#fffbeb",
            color:      "#92400e",
            border:     "1px solid #fde68a",
          },
          duration: 4000
        })
      }
    }

    // ── Run every 1 second ───────────
    intervalRef.current = setInterval(async () => {
      if (!modelsLoaded.current) return

      const video = videoRef.current
      if (!video || video.readyState !== 4) return

      const now = performance.now()

      try {
        // ════════════════════════════════
        // FACE DETECTION
        // ════════════════════════════════
        const faceResult = faceLandmarkerRef.current
          ?.detectForVideo(video, now)

        const faceCount = faceResult?.faceLandmarks?.length ?? 0

        // ── No face detected ────────────
        if (faceCount === 0) {
          emit(
            "NO_FACE",
            "No face detected — developer may have left seat",
            "HIGH"
          )
          return
        }

        // ── Multiple faces ──────────────
        if (faceCount > 1) {
          emit(
            "MULTIPLE_FACES",
            `${faceCount} faces detected — possible assistance`,
            "HIGH"
          )
        }

        // ── Head pose using transformation matrix ──
        const matrices = faceResult?.facialTransformationMatrixes
        if (matrices && matrices.length > 0) {
          const matrix = matrices[0].data

          // Extract rotation from 4x4 transformation matrix
          // matrix[0], matrix[4], matrix[8] = first 3 values of each row
          const rotationX = Math.asin(-matrix[9]) * (180 / Math.PI)
          const rotationY = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI)

          // Looking left or right
          if (Math.abs(rotationY) > 25) {
            emit(
              "HEAD_TURN",
              `Developer looking ${rotationY > 0 ? "left" : "right"} — possible distraction`,
              "MEDIUM"
            )
          }

          // Looking up (at another screen above?)
          if (rotationX < -20) {
            emit(
              "HEAD_UP",
              "Developer looking up — possible second monitor",
              "MEDIUM"
            )
          }

          // Looking down (at phone or notes?)
          if (rotationX > 20) {
            emit(
              "HEAD_DOWN",
              "Developer looking down — possible phone or notes",
              "MEDIUM"
            )
          }
        }

        // ── Eye gaze using blendshapes ──
        const blendshapes = faceResult?.faceBlendshapes
        if (blendshapes && blendshapes.length > 0) {
          const shapes = blendshapes[0].categories

          const getScore = (name: string) =>
            shapes.find((s) => s.categoryName === name)?.score ?? 0

          const eyeLookLeft  = getScore("eyeLookOutLeft") + getScore("eyeLookInRight")
          const eyeLookRight = getScore("eyeLookOutRight") + getScore("eyeLookInLeft")
          const eyeLookUp    = getScore("eyeLookUpLeft") + getScore("eyeLookUpRight")
          const eyeLookDown  = getScore("eyeLookDownLeft") + getScore("eyeLookDownRight")

          // Eyes looking far left or right
          if (eyeLookLeft > 0.7 || eyeLookRight > 0.7) {
            emit(
              "GAZE_SIDEWAYS",
              "Developer eyes looking sideways — possible distraction",
              "LOW"
            )
          }

          // Eyes looking up — possible second monitor
          if (eyeLookUp > 0.6) {
            emit(
              "GAZE_UP",
              "Developer eyes looking up — possible second screen",
              "LOW"
            )
          }

          // Eyes looking down too much — possible notes or phone
          if (eyeLookDown > 0.7) {
            emit(
              "GAZE_DOWN",
              "Developer eyes looking down — possible notes or phone",
              "LOW"
            )
          }

          // Eyes closed too long — possible reading something?
          const eyesClosed =
            getScore("eyeBlinkLeft") + getScore("eyeBlinkRight")
          if (eyesClosed > 1.5) {
            emit(
              "EYES_CLOSED",
              "Developer eyes closed",
              "LOW"
            )
          }
        }

      } catch {
        // silent — never break interview
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, interviewId])
}