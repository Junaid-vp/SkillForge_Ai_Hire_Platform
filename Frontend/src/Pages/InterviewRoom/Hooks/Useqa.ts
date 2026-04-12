// src/Pages/InterviewRoom/hooks/useQA.ts

import { useState, useRef, useEffect, useCallback } from "react"
import { getSocket } from "../../../Service/socket"
import { api } from "../../../Api/Axios"
import toast from "react-hot-toast"
import type { Question, Evaluation } from "../Types"

export function useQA(interviewId: string, isHR: boolean) {

  // ── State ────────────────────────────────────────────────────────────────
  const [questions,       setQuestions]       = useState<Question[]>([])
  const [techQuestions,   setTechQuestions]   = useState<Question[]>([])
  const [leetcodeQs,      setLeetcodeQs]      = useState<Question[]>([])
  const [evaluations,     setEvaluations]     = useState<Evaluation[]>([])
  const [currentQIndex,   setCurrentQIndex]   = useState(0)
  const [qaStarted,       setQaStarted]       = useState(false)
  const [awaitingAnswer,  setAwaitingAnswer]  = useState(false)
  const [isGenerating,    setIsGenerating]    = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [devAnswer,       setDevAnswer]       = useState("")
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [timeLeft,        setTimeLeft]        = useState(0)

  // ── Refs ─────────────────────────────────────────────────────────────────
  const devAnswerRef = useRef("")
  const timerRef     = useRef<number | null>(null)

  // Keep ref in sync — fixes stale closure in timer setInterval
  useEffect(() => { devAnswerRef.current = devAnswer }, [devAnswer])

  // ── Load questions + restore existing evaluations ────────────────────────
  const loadQuestions = useCallback((all: Question[]) => {
    setQuestions(all)
    setTechQuestions(all.filter((q) => !q.isLeetcode))
    setLeetcodeQs(all.filter((q) => q.isLeetcode))

    // Restore already evaluated answers (HR page refresh recovery)
    const loadedEvals: Evaluation[] = []
    all.forEach((q: any) => {
      if (q.answer && q.answer.score !== undefined && q.answer.score !== null) {
        let parsedVal: any = {}
        try { parsedVal = JSON.parse(q.answer.feedback) }
        catch { parsedVal = { feedback: q.answer.feedback } }

        loadedEvals.push({
          questionId:     q.id,
          score:          q.answer.score,
          feedback:       parsedVal.feedback       || "",
          missing:        parsedVal.missing        || "",
          recommendation: parsedVal.recommendation || "",
        })
      }
    })
    setEvaluations(loadedEvals)

    // Resume Q-index pointer for HR UI
    if (loadedEvals.length > 0) {
      setCurrentQIndex(loadedEvals.length - 1)
      setQaStarted(true)
    }
  }, [])

  // ── Generate questions via Groq AI ───────────────────────────────────────
  const generateQuestions = async () => {
    setIsGenerating(true)
    try {
      const interviewRes = await api.get("/interview/interviews")
      const interview    = interviewRes.data.data?.find((i: any) => i.id === interviewId)
      const skills       = interview?.developer?.skills
        ? interview.developer.skills.split("|")
        : []

      const res = await api.post("/questions/generate", {
        interviewId,
        position: interview?.developer?.position ?? "Software Developer",
        skills,
      })

      loadQuestions(res.data.data ?? [])
      toast.success(`${res.data.data?.length ?? 0} questions generated!`)
    } catch (e: any) {
      toast.error(e?.response?.data?.Message ?? "Failed to generate questions")
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Start Q&A — emits to developer + sends Q1 immediately ────────────────
  const startQA = () => {
    getSocket().emit("start-qa", interviewId)
    setQaStarted(true)
    sendQuestion(0)
  }

  // ── Send one question to developer ───────────────────────────────────────
  const sendQuestion = (index: number) => {
    const q = techQuestions[index]
    if (!q) return

    // Block if still waiting for developer to answer current question
    if (index > currentQIndex && qaStarted && awaitingAnswer) {
      toast("⏳ Wait for the developer to answer the current question first", {
        style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
      })
      return
    }

    setCurrentQIndex(index)
    setAwaitingAnswer(true)
    getSocket().emit("send-question", {
      interviewId,
      questionId:   q.id,
      questionText: q.questionText,
      orderIndex:   index + 1,
      total:        techQuestions.length,
      timeLimit:    180, // 3 minutes
    })
  }

  // ── Developer submits text answer ────────────────────────────────────────
  const submitAnswer = async () => {
    if (!devAnswerRef.current.trim() || !currentQuestion) return
    setIsSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      // Tell HR immediately via socket
      getSocket().emit("answer-submitted", {
        interviewId,
        questionId: currentQuestion.questionId,
      })

      // Save to DB — triggers AI evaluation in backend
      await api.post("/questions/answer/submit", {
        questionId:  currentQuestion.questionId,
        interviewId,
        answerText:  devAnswerRef.current,
      })

      setDevAnswer("")
      devAnswerRef.current = ""
      setCurrentQuestion(null)
      setTimeLeft(0)
      toast.success("Answer submitted!")
    } catch {
      toast.error("Failed to submit answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Countdown timer for developer ────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || isHR) return
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null

          // Auto-submit when time expires
          if (devAnswerRef.current.trim()) {
            submitAnswer()
          } else {
            devAnswerRef.current = "No answer provided"
            submitAnswer()
            toast("⏰ Time's up!", {
              style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000) as unknown as number

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [currentQuestion]) // eslint-disable-line — restarts on each new question

  return {
    // Data
    questions, techQuestions, leetcodeQs, evaluations,
    currentQIndex, qaStarted, awaitingAnswer, isGenerating,
    currentQuestion, devAnswer, setDevAnswer, isSubmitting, timeLeft,
    // Functions
    loadQuestions, generateQuestions, startQA, sendQuestion, submitAnswer,
    // Setters — used by socket events in parent
    setQaStarted, setCurrentQuestion, setEvaluations,
    setAwaitingAnswer, setTimeLeft, setCurrentQIndex,
  }
}