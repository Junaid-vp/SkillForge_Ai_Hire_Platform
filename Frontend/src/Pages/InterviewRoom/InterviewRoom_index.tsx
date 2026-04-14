import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  MessageSquare, Brain, FileText,
  Mic, MicOff, Video, VideoOff,
  Monitor, PhoneOff, Sparkles,
  AlertTriangle
} from "lucide-react"
import toast from "react-hot-toast"

import { getSocket, disconnectSocket } from "../../Service/socket"
import { api } from "../../Api/Axios"

import { useWebRTC }  from "./Hooks/Usewebrtc.ts"


import { useMalpracticeDetection } from "../../Hooks/useMalpracticeDetection"
import { useBrowserMalpractice }   from "../../Hooks/useBrowserMalpractice"
import { useObjectDetection }      from "../../Hooks/useObjectDetection"
import type { ChatMessage, Evaluation, LeetCodeQuestion } from "./Types.ts"
import { useQA } from "./Hooks/Useqa.ts"
import EmbeddedCodeEditor from "../../Dev/Components/Codeeditor.tsx"
import ChatPanel from "./Panels/Chatpanel.tsx"
import HRQAPanel from "./Panels/Hrqapanel.tsx"
import DevQAPanel from "./Panels/Devqapanel.tsx"
import NotesPanel from "./Panels/Notespanel.tsx"



// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewRoom_Index() {
  const { interviewId } = useParams()
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()

  const role     = searchParams.get("role") ?? "Developer"
  const userName = searchParams.get("name") ?? (role === "HR" ? "HR Manager" : "Developer")
  const isHR     = role === "HR"

  // ── Custom Hooks ──────────────────────────────────────────────────────────
  const webrtc = useWebRTC(interviewId ?? "", isHR, navigate)
  const qa     = useQA(interviewId ?? "", isHR)

  // ── Malpractice hooks (developer only) ────────────────────────────────────
  useMalpracticeDetection(interviewId, webrtc.localVideoRef, !isHR)
  useBrowserMalpractice(interviewId, !isHR)
  useObjectDetection(interviewId, webrtc.localVideoRef, !isHR)

  // ── UI State ──────────────────────────────────────────────────────────────
  const [messages,      setMessages]      = useState<ChatMessage[]>([])
  const [newMessage,    setNewMessage]    = useState("")
  const [activePanel,   setActivePanel]   = useState<"chat" | "qa" | "notes">("chat")
  const [showChat,      setShowChat]      = useState(true)
  const [notes,         setNotes]         = useState("")
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  // LeetCode editor state
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [leetcodeData,   setLeetcodeData]   = useState<LeetCodeQuestion[]>([])
  const [codingComplete, setCodingComplete] = useState(false)
  const [leetcodeStartTime, setLeetcodeStartTime] = useState<Date | null>(null)
  const [leetcodeElapsed,   setLeetcodeElapsed]   = useState(0)
  const [codeResults,       setCodeResults]       = useState<any[]>([])

  // ── LeetCode HR elapsed timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!leetcodeStartTime || !isHR) return
    const t = setInterval(() => {
      setLeetcodeElapsed(Math.floor((Date.now() - leetcodeStartTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [leetcodeStartTime, isHR])

  // ── Re-attach video streams when code editor closes ───────────────────────
  useEffect(() => {
    if (!showCodeEditor) {
      setTimeout(() => webrtc.reattachStreams(), 100)
    }
  }, [showCodeEditor]) // eslint-disable-line

  // ── All socket events ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!interviewId) return
    const socket = getSocket()

    // Chat
    socket.on("receive-message", (data: ChatMessage) => {
      setMessages(prev => [...prev, data])
    })

    // Q&A — Developer side
    socket.on("qa-started", () => {
      qa.setQaStarted(true)
      setActivePanel("qa")
      toast("📋 Q&A session has started!", {
        style: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
      })
    })

    socket.on("receive-question", (data: {
      questionId: string; questionText: string
      orderIndex: number; total: number; timeLimit: number
    }) => {
      qa.setQaStarted(true)
      qa.setCurrentQuestion(data)
      qa.setDevAnswer("")
      setActivePanel("qa")
      qa.setTimeLeft(data.timeLimit)
    })

    // Q&A — HR side
    socket.on("answer-submitted", () => {
      toast("✅ Developer submitted — AI evaluating...", {
        style: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
      })
    })

    socket.on("answer-evaluated", (data: Evaluation) => {
      qa.setEvaluations(prev => {
        const filtered = prev.filter(e => e.questionId !== data.questionId)
        return [...filtered, data]
      })
      qa.setAwaitingAnswer(false)
    })

    // LeetCode editor
    socket.on("open-code-editor", (data: { questions: LeetCodeQuestion[] }) => {
      setLeetcodeData(data.questions)
      setShowCodeEditor(true)
      setActivePanel("qa")
    })

    socket.on("coding-complete", () => {
      setCodingComplete(true)
      if (isHR) {
        toast("💻 Developer finished all coding problems!", { icon: "💻", duration: 5000 })
        setLeetcodeStartTime(null)
      }
    })

    socket.on("code-result", (data: any) => {
      if (isHR) {
        setCodeResults(prev => [data, ...prev].slice(0, 10))
      }
      toast(`💻 ${data.language}: ${data.status}`, {
        icon: data.status === "Accepted" ? "✅" : "❌",
        duration: 5000,
      })
    })

    // Room state hydration — restores state on page refresh
    socket.on("init-room-state", (state: any) => {
      if (state.qaStarted || state.currentQuestion) qa.setQaStarted(true)
      if (state.activePanel) setActivePanel(state.activePanel)
      if (state.showCodeEditor) setShowCodeEditor(true)

      if (state.currentQuestion) {
        if (state.answeredQuestionId === state.currentQuestion.questionId) {
          qa.setCurrentQuestion(null)
        } else {
          qa.setCurrentQuestion(state.currentQuestion)
          if (isHR) {
            qa.setCurrentQIndex(state.currentQuestion.orderIndex - 1)
            qa.setAwaitingAnswer(true)
          }
        }
      }
      if (state.timeLeft !== undefined) qa.setTimeLeft(state.timeLeft)
      if (state.leetcodeStartTime) setLeetcodeStartTime(new Date(state.leetcodeStartTime))
      if (state.codingComplete) setCodingComplete(true)
      if (state.messages) setMessages(state.messages)
    })

    // Malpractice (HR receives alerts)
    if (isHR) {
      socket.on("malpractice-alert", (data: {
        type: string; message: string; severity: string; timestamp: string
      }) => {
        if (data.severity === "HIGH") {
          toast(`🚨 ${data.message}`, {
            id: data.type,
            style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
            duration: 8000,
          })
        } else {
          toast(`⚠️ ${data.message}`, {
            id: data.type,
            style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
            duration: 5000,
          })
        }
      })
    }

    // Load HR data on mount
    if (isHR) {
      api.get(`/questions/note/${interviewId}`)
        .then(res => setNotes(res.data.data?.content ?? ""))
        .catch(() => {})
      api.get(`/questions/${interviewId}`)
        .then(res => qa.loadQuestions(res.data.data ?? []))
        .catch(() => {})
    }

    return () => {
      socket.off("receive-message")
      socket.off("qa-started")
      socket.off("receive-question")
      socket.off("answer-submitted")
      socket.off("answer-evaluated")
      socket.off("open-code-editor")
      socket.off("coding-complete")
      socket.off("code-result")
      socket.off("init-room-state")
      socket.off("malpractice-alert")
      // WebRTC sockets cleaned in useWebRTC
      socket.emit("leave-room", interviewId)
      disconnectSocket()
    }
  }, [interviewId, isHR]) // eslint-disable-line

  // ── HR: Open code editor for developer ───────────────────────────────────
  const openCodeEditor = () => {
    const questionsPayload = qa.leetcodeQs.map(q => ({
      id:            q.id,
      questionText:  q.questionText,
      estimatedTime: q.estimatedTime ?? null,
      inputExample:  q.inputExample  ?? null,
      outputExample: q.outputExample ?? null,
      constraints:   q.constraints   ?? null,
    }))
    getSocket().emit("open-code-editor", { interviewId, questions: questionsPayload })
    setLeetcodeStartTime(new Date())
    setLeetcodeElapsed(0)
    toast("💻 Code editor opened for developer", { icon: "💻" })
  }

  // ── Developer: All coding done ───────────────────────────────────────────
  const handleCodingComplete = useCallback(() => {
    setShowCodeEditor(false)
    setCodingComplete(true)
    getSocket().emit("coding-complete", { interviewId })
    toast.success("All problems submitted! Returning to interview...")
  }, [interviewId])

  // ── End call ─────────────────────────────────────────────────────────────
  const endCall = () => {
    webrtc.stopAll()
    const socket = getSocket()
    socket.emit("end-call-explicitly", interviewId)
    // Give the server 800ms to receive the event and update the DB status
    // before we disconnect the socket and navigate away
    setTimeout(() => {
      disconnectSocket()
      navigate(isHR ? "/dashboard" : "/devDashboard")
    }, 800)
  }

  const handleEndCallClick = () => {
    const qaInProgress = qa.qaStarted && qa.evaluations.length < qa.techQuestions.length
    if (qaInProgress) setShowEndConfirm(true)
    else endCall()
  }

  // ── Camera error screen ───────────────────────────────────────────────────
  if (webrtc.camError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center font-sans antialiased">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <VideoOff size={22} className="text-red-500" />
          </div>
          <p className="text-sm font-bold text-gray-900">Camera / Mic Access Denied</p>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Please allow camera and microphone access in your browser settings and refresh.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans antialiased">

      {/* ── End call confirmation modal ── */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-yellow-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 text-center mb-1">End Interview?</p>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
              Q&A is still in progress ({qa.evaluations.length}/{qa.techQuestions.length} questions answered).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={endCall}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 min-h-14 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">SkillForge AI</span>
          <span className="text-gray-200 mx-1">|</span>
          <p className="text-xs font-semibold text-gray-600">
            {isHR ? "HR Interview Room" : "Developer Interview Room"}
          </p>
          <span className="text-[10px] text-gray-300 font-mono">
            #{interviewId?.slice(0, 8)}
          </span>
        </div>
        <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
          webrtc.connected
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-yellow-50 text-yellow-600 border-yellow-200"
        }`}>
          {webrtc.connected
            ? "● Connected"
            : isHR ? "● Waiting for developer..." : "● Waiting for HR..."
          }
        </div>
      </header>

      {/* ── Embedded code editor (developer only) ── */}
      {showCodeEditor && !isHR && (
        <div className="flex-1 flex overflow-hidden">
          <EmbeddedCodeEditor
            interviewId={interviewId ?? ""}
            questions={leetcodeData}
            onAllSubmitted={handleCodingComplete}
          />
        </div>
      )}

      {/* ── Normal interview layout ── */}
      {(!showCodeEditor || isHR) && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Video area ── */}
          <div className="flex-1 relative bg-gray-900 overflow-hidden m-3 rounded-2xl shadow-sm border border-gray-200">

            {/* Screen share video */}
            <video
              ref={webrtc.remoteScreenRef}
              autoPlay playsInline
              className={`w-full h-full object-contain bg-gray-900 ${webrtc.remoteSharing ? "block" : "hidden"}`}
            />

            {/* Remote camera — fullscreen or PiP when sharing */}
            <video
              ref={webrtc.remoteVideoRef}
              autoPlay playsInline
              className={`transition-all duration-300 ${
                webrtc.remoteSharing
                  ? "absolute top-3 left-3 w-40 h-28 rounded-xl border-2 border-white/40 object-cover shadow-lg z-10"
                  : "w-full h-full object-cover"
              }`}
            />

            {/* Connecting spinner */}
            {!webrtc.connected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                <div className="text-center">
                  <div className={`w-12 h-12 border-[3px] border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
                    isHR ? "border-blue-400" : "border-indigo-400"
                  }`} />
                  <p className="text-white text-sm font-semibold">
                    {isHR ? "Waiting for developer to join..." : "Waiting for HR to join..."}
                  </p>
                  <p className="text-gray-500 text-xs mt-1.5">
                    You joined as:{" "}
                    <span className={`font-semibold ${isHR ? "text-blue-400" : "text-indigo-400"}`}>
                      {role}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Local camera PiP — bottom right */}
            <div className="absolute bottom-3 right-3 w-40 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-gray-800 z-10">
              <video ref={webrtc.localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {webrtc.isVideoOff && !webrtc.isSharing && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff size={18} className="text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                <span className="text-white text-[10px] font-medium truncate drop-shadow">{userName}</span>
                {webrtc.isSharing && (
                  <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full shrink-0 font-medium">Screen</span>
                )}
                {webrtc.isMuted && <MicOff size={9} className="text-red-400 shrink-0" />}
              </div>
            </div>

            {/* Screen share badges */}
            {webrtc.isSharing && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <Monitor size={12} /> Sharing your screen
              </div>
            )}
            {webrtc.remoteSharing && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <Monitor size={12} /> Viewing screen share
              </div>
            )}
            {webrtc.connected && !webrtc.remoteSharing && !webrtc.isSharing && (
              <div className="absolute top-3 right-3 bg-green-50 border border-green-200 text-green-600 text-[11px] font-semibold px-3 py-1.5 rounded-full z-10">
                ● Connected
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          {showChat && (
            <div className="w-96 bg-white flex flex-col border-l border-gray-100 shrink-0">

              {/* Panel tabs */}
              <div className="flex border-b border-gray-100 shrink-0">
                {[
                  { id: "chat",  label: "Chat",  icon: <MessageSquare size={13} /> },
                  { id: "qa",    label: "Q&A",   icon: <Brain size={13} /> },
                  { id: "notes", label: "Notes", icon: <FileText size={13} />, hrOnly: true },
                ].map((tab) => {
                  if (tab.hrOnly && !isHR) return null
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePanel(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                        activePanel === tab.id
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-400 border-transparent hover:text-gray-600"
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Panel content */}
              {activePanel === "chat" && (
                <ChatPanel
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  role={role}
                  userName={userName}
                  interviewId={interviewId ?? ""}
                />
              )}

              {activePanel === "qa" && isHR && (
                <HRQAPanel
                  qa={qa}
                  interviewId={interviewId ?? ""}
                  leetcodeStartTime={leetcodeStartTime}
                  leetcodeElapsed={leetcodeElapsed}
                  codingComplete={codingComplete}
                  codeResults={codeResults}
                  openCodeEditor={openCodeEditor}
                />
              )}

              {activePanel === "qa" && !isHR && (
                <DevQAPanel qa={qa} />
              )}

              {activePanel === "notes" && isHR && (
                <NotesPanel
                  notes={notes}
                  setNotes={setNotes}
                  interviewId={interviewId ?? ""}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Bottom controls ── */}
      <div className="bg-white border-t border-gray-100 px-8 py-3.5 flex items-center justify-between shrink-0">

        {/* Left — label + connection status */}
        <div className="w-48">
          <p className="text-xs font-semibold text-gray-800">
            {isHR ? "HR Interview Room" : "Developer Interview Room"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {webrtc.connected ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Waiting...
              </span>
            )}
          </p>
        </div>

        {/* Center — media controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={webrtc.toggleMute}
            title={webrtc.isMuted ? "Unmute" : "Mute"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              webrtc.isMuted
                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {webrtc.isMuted ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          <button
            onClick={webrtc.toggleVideo}
            title={webrtc.isVideoOff ? "Turn on camera" : "Turn off camera"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              webrtc.isVideoOff
                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {webrtc.isVideoOff ? <VideoOff size={17} /> : <Video size={17} />}
          </button>

          <button
            onClick={webrtc.toggleScreenShare}
            title={webrtc.isSharing ? "Stop sharing" : "Share screen"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              webrtc.isSharing
                ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Monitor size={17} />
          </button>

          <button
            onClick={handleEndCallClick}
            title="End call"
            className="w-11 h-11 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors text-white shadow-sm shadow-red-200/50"
          >
            <PhoneOff size={17} />
          </button>
        </div>

        {/* Right — show/hide panel */}
        <div className="w-48 flex justify-end">
          <button
            onClick={() => setShowChat(p => !p)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 border ${
              showChat
                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200/50"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageSquare size={14} />
            {showChat ? "Hide Panel" : "Show Panel"}
          </button>
        </div>
      </div>
    </div>
  )
}