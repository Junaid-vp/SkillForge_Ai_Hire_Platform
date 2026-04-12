// src/Pages/InterviewRoom.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Peer from "peerjs";
import {
  Mic, MicOff, Video, VideoOff,
  Monitor, PhoneOff, Send, MessageSquare,
  Sparkles, Brain, Code2, FileText,
  ChevronRight, CheckCircle2, Loader2,
  Star, Timer, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { disconnectSocket, getSocket } from "../Service/socket";
import { api } from "../Api/Axios";
import EmbeddedCodeEditor from "../Dev/Components/Codeeditor";
import { useMalpracticeDetection } from "../Hooks/useMalpracticeDetection";
import { useBrowserMalpractice } from "../Hooks/useBrowserMalpractice";
import { useObjectDetection } from "../Hooks/useObjectDetection";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  message:    string;
  senderName: string;
  senderRole: string;
  timestamp:  string;
}

interface Question {
  id:            string;
  questionText:  string;
  difficulty:    string;
  orderIndex:    number;
  isLeetcode:    boolean;
  estimatedTime: number | null;
  inputExample:  string | null;
  outputExample: string | null;
  constraints:   string | null;
}

interface Evaluation {
  questionId:     string;
  score:          number;
  feedback:       string;
  missing:        string;
  recommendation: string;
}

interface LeetCodeQuestion {
  id:            string;
  questionText:  string;
  estimatedTime: number | null;
  inputExample:  string | null;
  outputExample: string | null;
  constraints:   string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  const role     = searchParams.get("role") ?? "Developer";
  const userName = searchParams.get("name") ?? (role === "HR" ? "HR Manager" : "Developer");
  const isHR     = role === "HR";

  // ── Refs ───────────────────────────────────────────────────────────────────
  const localVideoRef           = useRef<HTMLVideoElement>(null);
  const remoteVideoRef          = useRef<HTMLVideoElement>(null);
  const remoteScreenRef         = useRef<HTMLVideoElement>(null);
  const peerRef                 = useRef<Peer | null>(null);
  const screenPeerRef           = useRef<Peer | null>(null);
  const streamRef               = useRef<MediaStream | null>(null);
  const incomingVideoStreamRef  = useRef<MediaStream | null>(null);
  const screenStreamRef         = useRef<MediaStream | null>(null);
  const incomingScreenStreamRef = useRef<MediaStream | null>(null);
  const timerRef                = useRef<number | null>(null);
  const leetcodeTimerRef        = useRef<number | null>(null);
  const devAnswerRef            = useRef("");
  const chatEndRef              = useRef<HTMLDivElement>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages,        setMessages]        = useState<ChatMessage[]>([]);
  const [newMessage,      setNewMessage]      = useState("");
  const [isMuted,         setIsMuted]         = useState(false);
  const [isVideoOff,      setIsVideoOff]      = useState(false);
  const [isSharing,       setIsSharing]       = useState(false);
  const [connected,       setConnected]       = useState(false);
  const [showChat,        setShowChat]        = useState(true);
  const [remoteSharing,   setRemoteSharing]   = useState(false);
  const [camError,        setCamError]        = useState(false);
  const [activePanel,     setActivePanel]     = useState<"chat" | "qa" | "notes">("chat");

  const [questions,     setQuestions]     = useState<Question[]>([]);
  const [techQuestions, setTechQuestions] = useState<Question[]>([]);
  const [leetcodeQs,    setLeetcodeQs]    = useState<Question[]>([]);

  const [currentQIndex,   setCurrentQIndex]   = useState(0);
  const [qaStarted,       setQaStarted]       = useState(false);
  const [evaluations,     setEvaluations]     = useState<Evaluation[]>([]);
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [devAnswer,       setDevAnswer]       = useState("");
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [awaitingAnswer,  setAwaitingAnswer]  = useState(false);
  const [timeLeft,        setTimeLeft]        = useState(0);

  const [notes,     setNotes]     = useState("");
  const [isSaving,  setIsSaving]  = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  const [leetcodeStartTime, setLeetcodeStartTime] = useState<Date | null>(null);
  const [leetcodeElapsed,   setLeetcodeElapsed]   = useState(0);
  const [codeResults,       setCodeResults]       = useState<any[]>([]);

  // ── FIX: Embedded editor state ────────────────────────────────────────────
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [leetcodeData,   setLeetcodeData]   = useState<LeetCodeQuestion[]>([]);
  const [codingComplete, setCodingComplete] = useState(false);

  // End call confirmation
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  

  useMalpracticeDetection(interviewId,remoteVideoRef,!isHR)
  useBrowserMalpractice(interviewId,!isHR)
  useObjectDetection(interviewId,remoteVideoRef,!isHR)



  // ── Keep devAnswerRef in sync ──────────────────────────────────────────────
  useEffect(() => { devAnswerRef.current = devAnswer; }, [devAnswer]);

  // ── Auto-scroll chat ───────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── LeetCode HR elapsed timer ──────────────────────────────────────────────
  useEffect(() => {
    if (!leetcodeStartTime || !isHR) return;
    leetcodeTimerRef.current = setInterval(() => {
      setLeetcodeElapsed(Math.floor((Date.now() - leetcodeStartTime.getTime()) / 1000));
    }, 1000) as unknown as number;
    return () => { if (leetcodeTimerRef.current) clearInterval(leetcodeTimerRef.current); };
  }, [leetcodeStartTime, isHR]);

  const loadQuestions = useCallback((all: Question[]) => {
    setQuestions(all);
    setTechQuestions(all.filter((q) => !q.isLeetcode));
    setLeetcodeQs(all.filter((q) => q.isLeetcode));

    // Extract already evaluated answers for HR
    const loadedEvals: Evaluation[] = [];
    all.forEach((q: any) => {
      if (q.answer && q.answer.score !== undefined && q.answer.score !== null) {
        let parsedVal: any = {};
        try { parsedVal = JSON.parse(q.answer.feedback); } catch { parsedVal = { feedback: q.answer.feedback }; }
        loadedEvals.push({
          questionId: q.id,
          score: q.answer.score,
          feedback: parsedVal.feedback || "",
          missing: parsedVal.missing || "",
          recommendation: parsedVal.recommendation || "",
        });
      }
    });
    setEvaluations(loadedEvals);
    
    // Resume Q-index pointer for HR UI immediately
    if (loadedEvals.length > 0) {
      setCurrentQIndex(loadedEvals.length - 1);
      setQaStarted(true); // Inherently true if answers already exist!
    }
  }, []);

  // ── FIX: Re-assign video streams after returning from code editor ──────────
  const reattachStreams = useCallback(() => {
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
    if (remoteVideoRef.current && incomingVideoStreamRef.current) {
      remoteVideoRef.current.srcObject = incomingVideoStreamRef.current;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteScreenRef.current && incomingScreenStreamRef.current) {
      remoteScreenRef.current.srcObject = incomingScreenStreamRef.current;
      remoteScreenRef.current.play().catch(() => {});
    }
  }, []);

  // ── Main setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!interviewId) return;
    const socket = getSocket();

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const peer = new Peer();
        peerRef.current = peer;

        peer.on("open", (myPeerId) => {
          socket.emit("join-room", interviewId);
          socket.emit("send-peer-id", { interviewId, peerId: myPeerId });
        });

        peer.on("call", (call) => {
          call.answer(streamRef.current || stream);
          call.on("stream", (remoteStream) => {
            incomingVideoStreamRef.current = remoteStream;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setTimeout(() => remoteVideoRef.current?.play().catch(() => {}), 100);
            }
            setConnected(true);
          });
        });

        socket.on("receive-peer-id", (remotePeerId: string) => {
          const call = peer.call(remotePeerId, streamRef.current || stream);
          call.on("stream", (remoteStream) => {
            incomingVideoStreamRef.current = remoteStream;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setTimeout(() => remoteVideoRef.current?.play().catch(() => {}), 100);
            }
            setConnected(true);
          });
        });

        socket.on("receive-screen-peer-id", (screenPeerId: string) => {
          const screenCall = peer.call(screenPeerId, stream);
          screenCall.on("stream", (incomingScreenStream) => {
            incomingScreenStreamRef.current = incomingScreenStream;
            setRemoteSharing(true);
          });
          screenCall.on("error", (err) => console.error("Screen call error:", err));
        });

        socket.on("screen-share-stopped", () => {
          setRemoteSharing(false);
          incomingScreenStreamRef.current = null;
          if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
        });

        socket.on("receive-message", (data: ChatMessage) => {
          setMessages((prev) => [...prev, data]);
        });

        socket.on("user-left", () => {
          setConnected(false);
          setRemoteSharing(false);
          if (remoteVideoRef.current)  remoteVideoRef.current.srcObject  = null;
          if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
          
          toast(isHR ? "The developer has disconnected." : "HR has disconnected.", { icon: "⚠️" });
          // NO AUTO-KICK. We wait for them to rejoin.
        });

        socket.on("end-call-explicitly", () => {
          toast(isHR ? "Developer ended the call." : "HR has ended the interview. Redirecting...", { icon: "👋", duration: 3000 });
          setTimeout(() => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
            peerRef.current?.destroy();
            screenPeerRef.current?.destroy();
            disconnectSocket();
            navigate(isHR ? "/dashboard" : "/devDashboard");
          }, 3000);
        });

        // Hydration Logic
        socket.on("init-room-state", (state: any) => {
          if (state.qaStarted || state.currentQuestion) setQaStarted(true);
          if (state.activePanel) setActivePanel(state.activePanel);
          if (state.showCodeEditor) setShowCodeEditor(true);
          
          if (state.currentQuestion) {
            if (state.answeredQuestionId === state.currentQuestion.questionId) {
              setCurrentQuestion(null);
            } else {
              setCurrentQuestion(state.currentQuestion);
              if (isHR) {
                setCurrentQIndex(state.currentQuestion.orderIndex - 1);
                setAwaitingAnswer(true);
              }
            }
          }
          if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft);
          if (state.leetcodeStartTime) setLeetcodeStartTime(new Date(state.leetcodeStartTime));
          if (state.codingComplete) setCodingComplete(true);
          if (state.messages) setMessages(state.messages);
        });

      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCamError(true);
        toast.error("Camera or microphone access was denied.");
      });

    // ── Q&A socket events ──────────────────────────────────────────────────

    socket.on("qa-started", () => {
      setQaStarted(true);
      setActivePanel("qa");
      toast("📋 Q&A session has started!", {
        style: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
      });
    });

    socket.on("receive-question", (data: {
      questionId:   string;
      questionText: string;
      orderIndex:   number;
      total:        number;
      timeLimit:    number;
    }) => {
      setQaStarted(true);
      setCurrentQuestion(data);
      setDevAnswer("");
      devAnswerRef.current = "";
      setActivePanel("qa");
      setTimeLeft(data.timeLimit);
    });

    socket.on("answer-submitted", () => {
      toast(" Developer submitted — AI evaluating...", {
        style: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
      });
    });

    socket.on("answer-evaluated", (data: Evaluation) => {
      setEvaluations((prev) => {
        const filtered = prev.filter((e) => e.questionId !== data.questionId);
        return [...filtered, data];
      });
      setAwaitingAnswer(false);
    });

    // ── FIX: Show embedded editor — video refs stay alive ──────────────────
    socket.on("open-code-editor", (data: { questions: LeetCodeQuestion[] }) => {
      setLeetcodeData(data.questions);
      setShowCodeEditor(true);
      setActivePanel("qa");
    });

    socket.on("coding-complete", () => {
      setCodingComplete(true);
      if (isHR) {
        toast(" Developer finished all coding problems!", { icon: "💻", duration: 5000 });
        if (leetcodeTimerRef.current) clearInterval(leetcodeTimerRef.current);
        setLeetcodeStartTime(null);
      }
    });

    socket.on("code-result", (data: any) => {
      if (isHR) {
        setCodeResults((prev) => [data, ...prev].slice(0, 10));
      }
      toast(`💻 ${data.language}: ${data.status}`, {
        icon:     data.status === "Accepted" ? "✅" : "❌",
        duration: 5000,
      });
    });

    if (isHR) {
      api.get(`/questions/note/${interviewId}`)
        .then((res) => setNotes(res.data.data?.content ?? ""))
        .catch(() => {});
      api.get(`/questions/${interviewId}`)
        .then((res) => loadQuestions(res.data.data ?? []))
        .catch(() => {});
    }

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
      screenPeerRef.current?.destroy();
      socket.emit("leave-room", interviewId);
      socket.off("receive-peer-id");
      socket.off("receive-screen-peer-id");
      socket.off("screen-share-stopped");
      socket.off("receive-message");
      socket.off("user-left");
      socket.off("qa-started");
      socket.off("receive-question");
      socket.off("answer-submitted");
      socket.off("answer-evaluated");
      socket.off("open-code-editor");
      socket.off("coding-complete");
      socket.off("code-result");
      disconnectSocket();
    };
  }, [interviewId, isHR, navigate, loadQuestions]);

  // ── Dev Q&A countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0 || isHR) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          if (devAnswerRef.current.trim()) {
            submitAnswer();
          } else {
            devAnswerRef.current = "No answer provided";
            submitAnswer();
            toast("⏰ Time's up!", {
              style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQuestion]); // eslint-disable-line

  // ── Assign incoming screen stream ──────────────────────────────────────────
  useEffect(() => {
    if (remoteSharing && remoteScreenRef.current && incomingScreenStreamRef.current) {
      remoteScreenRef.current.srcObject = incomingScreenStreamRef.current;
    }
  }, [remoteSharing]);

  // ── FIX: Re-attach streams when returning from code editor ────────────────
  useEffect(() => {
    if (!showCodeEditor) {
      // Small delay to let DOM re-render first
      setTimeout(() => {
        reattachStreams();
      }, 100);
    }
  }, [showCodeEditor, reattachStreams]);

  // ── Malpractice alerts (HR only) ───────────────────────────────────────────
  useEffect(() => {
    if (!isHR || !interviewId) return;
    const socket = getSocket();
    socket.on("malpractice-alert", (data: {
      type: string; message: string; severity: string; timestamp: string;
    }) => {
      if (data.severity === "HIGH") {
        toast(`🚨 ${data.message}`, {
          id: data.type,
          style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
          duration: 8000,
        });
      } else {
        toast(`⚠️ ${data.message}`, {
          id: data.type,
          style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
          duration: 5000,
        });
      }
    });
    return () => { socket.off("malpractice-alert"); };
  }, [interviewId, isHR]);

  // ── HR: Generate questions ─────────────────────────────────────────────────
  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const interviewRes = await api.get("/interview/interviews");
      const interview    = interviewRes.data.data?.find((i: any) => i.id === interviewId);
      const skills       = interview?.developer?.skills
        ? interview.developer.skills.split("|")
        : [];
      const res = await api.post("/questions/generate", {
        interviewId,
        position: interview?.developer?.position ?? "Software Developer",
        skills,
      });
      loadQuestions(res.data.data ?? []);
      toast.success(`${res.data.data?.length ?? 0} questions generated!`);
    } catch (e: any) {
      toast.error(e?.response?.data?.Message ?? "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── HR: Start Q&A ──────────────────────────────────────────────────────────
  const startQA = () => {
    getSocket().emit("start-qa", interviewId);
    setQaStarted(true);
    setActivePanel("qa");
    sendQuestion(0);
  };

  // ── HR: Send one question ──────────────────────────────────────────────────
  const sendQuestion = (index: number) => {
    const q = techQuestions[index];
    if (!q) return;

    if (index > currentQIndex && qaStarted && awaitingAnswer) {
      toast("⏳ Wait for the developer to answer the current question first", {
        style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
      });
      return;
    }

    setCurrentQIndex(index);
    setAwaitingAnswer(true);
    getSocket().emit("send-question", {
      interviewId,
      questionId:   q.id,
      questionText: q.questionText,
      orderIndex:   index + 1,
      total:        techQuestions.length,
      timeLimit:    180,
    });
  };

  // ── Developer: Submit text answer ──────────────────────────────────────────
  const submitAnswer = async () => {
    if (!devAnswerRef.current.trim() || !currentQuestion) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      getSocket().emit("answer-submitted", {
        interviewId,
        questionId: currentQuestion.questionId,
      });
      await api.post("/questions/answer/submit", {
        questionId:  currentQuestion.questionId,
        interviewId,
        answerText:  devAnswerRef.current,
      });
      setDevAnswer("");
      devAnswerRef.current = "";
      setCurrentQuestion(null);
      setTimeLeft(0);
      toast.success("Answer submitted!");
    } catch {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── HR: Open embedded code editor ─────────────────────────────────────────
  const openCodeEditor = () => {
    const questionsPayload = leetcodeQs.map((q) => ({
      id:            q.id,
      questionText:  q.questionText,
      estimatedTime: q.estimatedTime ?? null,
      inputExample:  q.inputExample  ?? null,
      outputExample: q.outputExample ?? null,
      constraints:   q.constraints   ?? null,
    }));
    getSocket().emit("open-code-editor", { interviewId, questions: questionsPayload });
    setLeetcodeStartTime(new Date());
    setLeetcodeElapsed(0);
    toast("Code editor opened for developer", { icon: "💻" });
  };

  // ── FIX: Called when dev submits all problems — re-attach streams ─────────
  const handleCodingComplete = useCallback(() => {
    setShowCodeEditor(false);
    setCodingComplete(true);
    getSocket().emit("coding-complete", { interviewId });
    toast.success("All problems submitted! Returning to interview...");
    // streams re-attach via the useEffect watching showCodeEditor
  }, [interviewId]);

  // ── HR: Save notes ─────────────────────────────────────────────────────────
  const saveNotes = async () => {
    setIsSaving(true);
    try {
      await api.post("/questions/note/save", { interviewId, content: notes });
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2000);
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Media controls ─────────────────────────────────────────────────────────
  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMuted((p) => !p); }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsVideoOff((p) => !p); }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;
      const screenPeer = new Peer();
      screenPeerRef.current = screenPeer;
      screenPeer.on("open", (screenPeerId) => {
        getSocket().emit("send-screen-peer-id", { interviewId, screenPeerId });
      });
      screenPeer.on("call", (call) => { call.answer(screenStream); });
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
      setIsSharing(true);
    } catch {
      console.log("Screen share cancelled or denied");
    }
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    screenPeerRef.current?.destroy();
    screenPeerRef.current = null;
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
    }
    getSocket().emit("screen-share-stopped", interviewId);
    setIsSharing(false);
  };

  const toggleScreenShare = () => isSharing ? stopScreenShare() : startScreenShare();

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    getSocket().emit("send-message", {
      interviewId,
      message:    newMessage.trim(),
      senderName: userName,
      senderRole: role,
    });
    setNewMessage("");
  };

  const handleEndCallClick = () => {
    const qaInProgress = qaStarted && evaluations.length < techQuestions.length;
    if (qaInProgress) setShowEndConfirm(true);
    else endCall();
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    screenPeerRef.current?.destroy();
    getSocket().emit("end-call-explicitly", interviewId); // Explicit end triggers kick
    disconnectSocket();
    navigate(isHR ? "/dashboard" : "/devDashboard");
  };

  const scoreColor = (score: number) =>
    score >= 8 ? "text-green-500" : score >= 5 ? "text-yellow-500" : "text-red-500";

  const formatElapsed = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const avgScore = evaluations.length > 0
    ? evaluations.reduce((a, e) => a + e.score, 0) / evaluations.length
    : 0;

  // ── Camera error ───────────────────────────────────────────────────────────
  if (camError) {
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
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans antialiased">

      {/* End-call confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-yellow-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 text-center mb-1">End Interview?</p>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
              Q&A is still in progress ({evaluations.length}/{techQuestions.length} questions answered).
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
          <span className="text-[10px] text-gray-300 font-mono">#{interviewId?.slice(0, 8)}</span>
        </div>
        <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
          connected
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-yellow-50 text-yellow-600 border-yellow-200"
        }`}>
          {connected ? "● Connected" : isHR ? "● Waiting for developer..." : "● Waiting for HR..."}
        </div>
      </header>

      {/* ── FIX: Embedded code editor — video refs passed from parent ── */}
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

            <video
              ref={remoteScreenRef}
              autoPlay playsInline
              className={`w-full h-full object-contain bg-gray-900 ${remoteSharing ? "block" : "hidden"}`}
            />

            <video
              ref={remoteVideoRef}
              autoPlay playsInline
              className={`transition-all duration-300 ${
                remoteSharing
                  ? "absolute top-3 left-3 w-40 h-28 rounded-xl border-2 border-white/40 object-cover shadow-lg z-10"
                  : "w-full h-full object-cover"
              }`}
            />

            {!connected && (
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

            {/* Local PiP — bottom-right, safe from buttons */}
            <div className="absolute bottom-3 right-3 w-40 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-gray-800 z-10">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {isVideoOff && !isSharing && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff size={18} className="text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                <span className="text-white text-[10px] font-medium truncate drop-shadow">{userName}</span>
                {isSharing && (
                  <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full shrink-0 font-medium">Screen</span>
                )}
                {isMuted && <MicOff size={9} className="text-red-400 shrink-0" />}
              </div>
            </div>

            {isSharing && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <Monitor size={12} /> Sharing your screen
              </div>
            )}
            {remoteSharing && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <Monitor size={12} /> Viewing screen share
              </div>
            )}
            {connected && !remoteSharing && !isSharing && (
              <div className="absolute top-3 right-3 bg-green-50 border border-green-200 text-green-600 text-[11px] font-semibold px-3 py-1.5 rounded-full z-10">
                ● Connected
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          {showChat && (
            <div className="w-96 bg-white flex flex-col border-l border-gray-100 shrink-0">

              <div className="flex border-b border-gray-100 shrink-0">
                {[
                  { id: "chat",  label: "Chat",  icon: <MessageSquare size={13} /> },
                  { id: "qa",    label: "Q&A",   icon: <Brain size={13} /> },
                  { id: "notes", label: "Notes", icon: <FileText size={13} />, hrOnly: true },
                ].map((tab) => {
                  if (tab.hrOnly && !isHR) return null;
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
                  );
                })}
              </div>

              {/* ── CHAT TAB ── */}
              {activePanel === "chat" && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    {messages.length === 0 && (
                      <div className="text-center mt-10">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <MessageSquare size={18} className="text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400">No messages yet</p>
                      </div>
                    )}
                    {messages.map((msg, i) => {
                      const isMe = msg.senderRole === role;
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <span className="text-[10px] text-gray-400 mb-1 px-1">{msg.senderName}</span>
                          <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm"
                          }`}>
                            {msg.message}
                          </div>
                          <span className="text-[9px] text-gray-300 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                    <div className="flex gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 text-gray-800 text-xs placeholder-gray-400 rounded-xl px-3 py-2.5 outline-none border border-gray-100 focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center shrink-0"
                      >
                        <Send size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Q&A TAB ── */}
              {activePanel === "qa" && (
                <div className="flex flex-col flex-1 overflow-hidden">

                  {isHR && (
                    <div className="flex flex-col flex-1 overflow-hidden">

                      {questions.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Brain size={22} className="text-blue-500" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 mb-1">No questions yet</p>
                          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Generate AI questions based on developer's skills
                          </p>
                          <button
                            onClick={generateQuestions}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                          >
                            {isGenerating
                              ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                              : <><Brain size={13} /> Generate Questions</>
                            }
                          </button>
                        </div>
                      )}

                      {questions.length > 0 && (
                        <div className="flex flex-col flex-1 overflow-hidden">

                          {!qaStarted && (
                            <div className="p-4 border-b border-gray-100 shrink-0">
                              <button
                                onClick={startQA}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                              >
                                <Brain size={13} />
                                Start Q&A — {techQuestions.length} Technical Questions
                              </button>
                            </div>
                          )}

                          <div className="flex-1 overflow-y-auto">

                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Technical Questions ({techQuestions.length})
                              </p>
                            </div>

                            <div className="p-3 space-y-2">
                              {techQuestions.map((q, index) => {
                                const eval_      = evaluations.find((e) => e.questionId === q.id);
                                const isCurrent  = index === currentQIndex && qaStarted;
                                const isAnswered = !!eval_;
                                const isNext     = qaStarted && index === currentQIndex + 1 && !isAnswered && !awaitingAnswer;

                                return (
                                  <div
                                    key={q.id}
                                    className={`rounded-xl border p-3 transition-all ${
                                      isCurrent   ? "border-blue-300 bg-blue-50"
                                      : isAnswered ? "border-green-200 bg-green-50/50"
                                      : "border-gray-100 bg-white"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                          <span className="text-[10px] font-bold text-gray-400">Q{q.orderIndex}</span>
                                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                            q.difficulty === "Hard"   ? "bg-red-100 text-red-600"
                                            : q.difficulty === "Medium" ? "bg-yellow-100 text-yellow-600"
                                            : "bg-green-100 text-green-600"
                                          }`}>{q.difficulty}</span>
                                          {isCurrent && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Active</span>}
                                          {isCurrent && awaitingAnswer && <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">Answering...</span>}
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{q.questionText}</p>
                                      </div>

                                      {isAnswered ? (
                                        <div className="shrink-0 text-center">
                                          <span className={`text-base font-black ${scoreColor(eval_!.score)}`}>{eval_!.score}</span>
                                          <span className="text-[9px] text-gray-400 block">/10</span>
                                        </div>
                                      ) : isNext ? (
                                        <button
                                          onClick={() => sendQuestion(index)}
                                          className="shrink-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center"
                                        >
                                          <ChevronRight size={13} className="text-white" />
                                        </button>
                                      ) : null}
                                    </div>

                                    {eval_ && (
                                      <div className="mt-2 pt-2 border-t border-green-100">
                                        <p className="text-[10px] text-gray-600 leading-relaxed">{eval_.feedback}</p>
                                        {eval_.missing && <p className="text-[10px] text-red-500 mt-1">Missing: {eval_.missing}</p>}
                                        <span className={`text-[9px] font-bold mt-1 block ${
                                          eval_.recommendation === "Strong"  ? "text-green-600"
                                          : eval_.recommendation === "Average" ? "text-yellow-600"
                                          : "text-red-600"
                                        }`}>{eval_.recommendation}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {leetcodeQs.length > 0 && (
                              <>
                                <div className="px-4 py-2 bg-orange-50 border-y border-orange-100 sticky top-0 z-10 mt-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                                      LeetCode ({leetcodeQs.length})
                                    </p>
                                    {leetcodeStartTime && !codingComplete && (
                                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        leetcodeElapsed > 1200 ? "bg-red-100 text-red-600"
                                        : leetcodeElapsed > 600  ? "bg-yellow-100 text-yellow-600"
                                        : "bg-green-100 text-green-600"
                                      }`}>
                                        <Timer size={9} />
                                        {formatElapsed(leetcodeElapsed)}
                                      </div>
                                    )}
                                    {codingComplete && (
                                      <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                        Completed
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="p-3 space-y-2">
                                  {leetcodeQs.map((q) => (
                                    <div key={q.id} className="rounded-xl border border-orange-100 bg-orange-50/30 p-3">
                                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                        <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">LeetCode</span>
                                        {q.estimatedTime && (
                                          <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                                            ~{q.estimatedTime} min
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{q.questionText}</p>
                                    </div>
                                  ))}
                                </div>

                                {qaStarted && !leetcodeStartTime && !codingComplete && (
                                  <div className="p-4 border-t border-gray-100">
                                    <button
                                      onClick={openCodeEditor}
                                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                                    >
                                      <Code2 size={13} />
                                      Open Code Editor for Developer
                                    </button>
                                    <p className="text-[10px] text-gray-400 text-center mt-2">
                                      Embedded — video call stays active
                                    </p>
                                  </div>
                                )}

                                {leetcodeStartTime && !codingComplete && (
                                  <div className="p-4 border-t border-gray-100">
                                    <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-center">
                                      <p className="text-xs font-semibold text-purple-700">💻 Developer is coding</p>
                                      <p className="text-[10px] text-purple-500 mt-0.5">Video stays connected</p>
                                    </div>
                                  </div>
                                )}

                                {codeResults.length > 0 && (
                                  <div className="p-3 space-y-1.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">Live Runs</p>
                                    {codeResults.slice(0, 5).map((r, i) => (
                                      <div key={i} className={`rounded-lg border px-3 py-2 text-xs flex items-center justify-between ${
                                        r.status === "Accepted" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                                      }`}>
                                        <div>
                                          <span className="font-semibold text-gray-700">{r.language}</span>
                                          <span className="text-gray-400 mx-1">·</span>
                                          <span className={r.status === "Accepted" ? "text-green-600" : "text-red-600"}>{r.status}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{r.time}s</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {evaluations.length > 0 && (
                              <div className="mx-3 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-800">Average Score</p>
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-500" />
                                    <span className={`text-sm font-black ${scoreColor(avgScore)}`}>{avgScore.toFixed(1)}</span>
                                    <span className="text-xs text-gray-400">/10</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Based on {evaluations.length} answered question{evaluations.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!isHR && (
                    <div className="flex flex-col flex-1 overflow-hidden">

                      {!qaStarted && !currentQuestion && (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Brain size={22} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-800 mb-1">Waiting for HR</p>
                          <p className="text-xs text-gray-400">HR will start the Q&A session soon</p>
                        </div>
                      )}

                      {currentQuestion && (
                        <div className="flex flex-col flex-1 overflow-hidden p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-blue-600">
                              Question {currentQuestion.orderIndex} of {currentQuestion.total}
                            </span>
                            {timeLeft > 0 && (
                              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                                timeLeft <= 30  ? "bg-red-100 text-red-600"
                                : timeLeft <= 60 ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                              }`}>
                                <Timer size={11} />
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                            <p className="text-sm text-gray-800 leading-relaxed">{currentQuestion.questionText}</p>
                          </div>

                          <textarea
                            value={devAnswer}
                            onChange={(e) => setDevAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className="flex-1 bg-gray-50 text-gray-800 text-sm placeholder-gray-400 rounded-xl p-3 outline-none border border-gray-100 focus:border-blue-300 resize-none min-h-[120px]"
                          />

                          <button
                            onClick={submitAnswer}
                            disabled={!devAnswer.trim() || isSubmitting}
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                          >
                            {isSubmitting
                              ? <><Loader2 size={13} className="animate-spin" /> Submitting...</>
                              : <><CheckCircle2 size={13} /> Submit Answer</>
                            }
                          </button>
                        </div>
                      )}

                      {qaStarted && !currentQuestion && (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <Loader2 size={24} className="text-blue-500 animate-spin mb-3" />
                          <p className="text-sm font-semibold text-gray-700">Answer submitted!</p>
                          <p className="text-xs text-gray-400 mt-1">Waiting for next question from HR...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activePanel === "notes" && isHR && (
                <div className="flex flex-col flex-1 overflow-hidden p-4">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <p className="text-xs font-bold text-gray-800">Interview Notes</p>
                    <button
                      onClick={saveNotes}
                      disabled={isSaving}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {isSaving
                        ? <>`<Loader2 size={10} className="animate-spin" /> Saving...</>
                        : savedNote
                        ? <><CheckCircle2 size={10} className="text-green-500" /> Saved!</>
                        : "Save Notes"
                      }
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={`Write notes about developer performance...\n\nExamples:\n• Strong React knowledge\n• Struggled with async/await\n• Good communication`}
                    className="flex-1 bg-gray-50 text-gray-800 text-xs placeholder-gray-400 rounded-xl p-3 outline-none border border-gray-100 focus:border-blue-300 resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 shrink-0">Only you can see these notes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Bottom controls ── */}
      <div className="bg-white border-t border-gray-100 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="w-48">
          <p className="text-xs font-semibold text-gray-800">
            {isHR ? "HR Interview Room" : "Developer Interview Room"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {connected ? (
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

        <div className="flex items-center gap-2.5">
          <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isMuted ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
              : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}>
            {isMuted ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          <button onClick={toggleVideo} title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isVideoOff ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
              : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}>
            {isVideoOff ? <VideoOff size={17} /> : <Video size={17} />}
          </button>

          <button onClick={toggleScreenShare} title={isSharing ? "Stop sharing" : "Share screen"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isSharing ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
              : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
            }`}>
            <Monitor size={17} />
          </button>

          <button onClick={handleEndCallClick} title="End call"
            className="w-11 h-11 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors text-white shadow-sm shadow-red-200/50">
            <PhoneOff size={17} />
          </button>
        </div>

        <div className="w-48 flex justify-end">
          <button
            onClick={() => setShowChat(!showChat)}
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
  );
}