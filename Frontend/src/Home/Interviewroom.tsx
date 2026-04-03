import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Peer from "peerjs";
import {
  Mic, MicOff, Video, VideoOff,
  Monitor, PhoneOff, Send, MessageSquare,
  Sparkles,
} from "lucide-react";
import { disconnectSocket, getSocket } from "../Service/socket";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  message:    string;
  senderName: string;
  senderRole: string;
  timestamp:  string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  const role     = searchParams.get("role") ?? "HR";
  const userName = searchParams.get("name") ?? (role === "HR" ? "HR Manager" : "Developer");
  const isHR     = role === "HR";

  // ── Refs ──────────────────────────────────────────────────────────────────
  const localVideoRef   = useRef<HTMLVideoElement>(null);  // your camera
  const remoteVideoRef  = useRef<HTMLVideoElement>(null);  // their camera
  const remoteScreenRef = useRef<HTMLVideoElement>(null);  // their screen

  const peerRef        = useRef<Peer | null>(null);        // main camera peer
  const screenPeerRef  = useRef<Peer | null>(null);        // screen share peer
  const streamRef      = useRef<MediaStream | null>(null); // your camera stream
  const screenStreamRef= useRef<MediaStream | null>(null); // your screen stream
  const incomingScreenStreamRef = useRef<MediaStream | null>(null); // their screen stream (stored for assignment after mount)

  // ── State ─────────────────────────────────────────────────────────────────
  const [messages,     setMessages]     = useState<ChatMessage[]>([]);
  const [newMessage,   setNewMessage]   = useState("");
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);
  const [isSharing,    setIsSharing]    = useState(false);
  const [connected,    setConnected]    = useState(false);
  const [showChat,     setShowChat]     = useState(true);
  const [remoteSharing,setRemoteSharing]= useState(false);
  const [camError,     setCamError]     = useState(false);

  // ── Main setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!interviewId) return;

    const socket = getSocket();

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;

        // Show your own camera
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // ── Create main peer (camera + audio) ──────────────────────────────
        const peer = new Peer();
        peerRef.current = peer;

        peer.on("open", (myPeerId) => {
          console.log("Camera Peer ID:", myPeerId);
          socket.emit("join-room", interviewId);
          socket.emit("send-peer-id", { interviewId, peerId: myPeerId });
        });

        // Answer incoming camera calls
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setConnected(true);
            }
          });
        });

        // Receive other person's camera peer ID → call them
        socket.on("receive-peer-id", (remotePeerId: string) => {
          console.log("Calling camera peer:", remotePeerId);
          const call = peer.call(remotePeerId, stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              setConnected(true);
            }
          });
        });

        // receive their screen peer ID
        
        socket.on("receive-screen-peer-id", (screenPeerId: string) => {
          console.log("Received screen peer ID, calling:", screenPeerId);

          // Call their screen peer using our camera stream
          const screenCall = peer.call(screenPeerId, stream);

          screenCall.on("stream", (incomingScreenStream) => {
            console.log("Received remote screen stream");
            // Store stream in ref first, then trigger render
            incomingScreenStreamRef.current = incomingScreenStream;
            setRemoteSharing(true);
          });

          screenCall.on("error", (err) => {
            console.error("Screen call error:", err);
          });
        });

        // ── Screen share stopped ───────────────────────────────────────────
        socket.on("screen-share-stopped", () => {
          setRemoteSharing(false);
          incomingScreenStreamRef.current = null;
          if (remoteScreenRef.current) {
            remoteScreenRef.current.srcObject = null;
          }
        });

        // ── Chat ───────────────────────────────────────────────────────────
        socket.on("receive-message", (data: ChatMessage) => {
          setMessages((prev) => [...prev, data]);
        });

        // ── Other person left ──────────────────────────────────────────────
        socket.on("user-left", () => {
          setConnected(false);
          setRemoteSharing(false);
          if (remoteVideoRef.current)  remoteVideoRef.current.srcObject  = null;
          if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
        });
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCamError(true);
      });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
      screenPeerRef.current?.destroy();
      socket.emit("leave-room", interviewId);
      disconnectSocket();
    };
  }, [interviewId]);

  // ── Assign incoming screen stream to video element once it mounts ────────
  useEffect(() => {
    if (remoteSharing && remoteScreenRef.current && incomingScreenStreamRef.current) {
      remoteScreenRef.current.srcObject = incomingScreenStreamRef.current;
    }
  }, [remoteSharing]);

  // ── Toggle mute ───────────────────────────────────────────────────────────
  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted((p) => !p);
    }
  };

  // ── Toggle video ──────────────────────────────────────────────────────────
  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOff((p) => !p);
    }
  };

  // ── Start screen share ────────────────────────────────────────────────────
  const startScreenShare = async () => {
    const socket = getSocket();
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;

      // Create a SEPARATE peer just for screen share
      const screenPeer = new Peer();
      screenPeerRef.current = screenPeer;

      screenPeer.on("open", (screenPeerId) => {
        console.log("Screen Peer ID:", screenPeerId);
        // Tell other person your screen peer ID
        socket.emit("send-screen-peer-id", { interviewId, screenPeerId });
      });

      //  When other person calls this screen peer → answer with screen stream
      screenPeer.on("call", (call) => {
        call.answer(screenStream);
        
      });

      // Show screen in your local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // When user stops via browser's built-in stop button
      screenStream.getVideoTracks()[0].onended = () => stopScreenShare();

      setIsSharing(true);
    } catch {
      console.log("Screen share cancelled or denied");
    }
  };

  // ── Stop screen share ─────────────────────────────────────────────────────
  const stopScreenShare = () => {
    const socket = getSocket();

    // Stop screen tracks
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    // Destroy screen peer
    screenPeerRef.current?.destroy();
    screenPeerRef.current = null;

    // Switch local preview back to camera
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
    }

    // Tell other person screen share stopped
    socket.emit("screen-share-stopped", interviewId);

    setIsSharing(false);
  };

  const toggleScreenShare = () => {
    if (isSharing) stopScreenShare();
    else startScreenShare();
  };

  // ── Send chat message ─────────────────────────────────────────────────────
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

  // ── End call ──────────────────────────────────────────────────────────────
  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    screenPeerRef.current?.destroy();
    getSocket().emit("leave-room", interviewId);
    disconnectSocket();
    navigate(isHR ? "/dashboard" : "/devDashboard");
  };

  // ── Camera error screen ───────────────────────────────────────────────────
  if (camError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center font-sans antialiased">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <VideoOff size={22} className="text-red-500" />
          </div>
          <p className="text-sm font-bold text-gray-900">Camera / Mic Access Denied</p>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Please allow camera and microphone access in your browser settings and refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200/50"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans antialiased">

      {/* ── Top bar ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 min-h-14 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">
            SkillForge AI
          </span>
          <span className="text-gray-200 mx-1">|</span>
          <p className="text-xs font-semibold text-gray-600">
            {isHR ? "HR Interview Room" : "Developer Interview Room"}
          </p>
          <span className="text-[10px] text-gray-300 font-mono">
            #{interviewId?.slice(0, 8)}
          </span>
        </div>
        <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
          connected
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-yellow-50 text-yellow-600 border-yellow-200"
        }`}>
          {connected
            ? "● Connected"
            : isHR ? "● Waiting for developer..." : "● Waiting for HR..."}
        </div>
      </header>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Video area ── */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden m-3 rounded-2xl shadow-sm border border-gray-200">

          {/* Remote SCREEN — big main area when sharing active */}
          <video
            ref={remoteScreenRef}
            autoPlay
            playsInline
            className={`w-full h-full object-contain bg-gray-900 ${
              remoteSharing ? "block" : "hidden"
            }`}
          />

          {/* Remote CAMERA
              - Full screen when no screen share
              - Small pip top-left when screen share active */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`transition-all duration-300 ${
              remoteSharing
                ? "absolute top-3 left-3 w-40 h-28 rounded-xl border-2 border-white/40 object-cover shadow-lg z-10"
                : "w-full h-full object-cover"
            }`}
          />

          {/* Waiting screen */}
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

          {/* Your local video — pip bottom right */}
          <div className="absolute bottom-3 right-3 w-40 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-gray-800 z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && !isSharing && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff size={18} className="text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
              <span className="text-white text-[10px] font-medium truncate drop-shadow">
                {userName}
              </span>
              {isSharing && (
                <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full shrink-0 font-medium">
                  Screen
                </span>
              )}
              {isMuted && (
                <MicOff size={9} className="text-red-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Badge — you are sharing */}
          {isSharing && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
              <Monitor size={12} /> Sharing your screen
            </div>
          )}

          {/* Badge — remote person is sharing */}
          {remoteSharing && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
              <Monitor size={12} /> Viewing screen share
            </div>
          )}

          {/* Connected badge — shown only when no sharing */}
          {connected && !remoteSharing && !isSharing && (
            <div className="absolute top-3 right-3 bg-green-50 border border-green-200 text-green-600 text-[11px] font-semibold px-3 py-1.5 rounded-full z-10">
              ● Connected
            </div>
          )}
        </div>

        {/* ── Chat panel ── */}
        {showChat && (
          <div className="w-80 bg-white flex flex-col border-l border-gray-100 shrink-0">

            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <p className="text-sm font-semibold text-gray-900">Live Chat</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Visible to both participants</p>
              </div>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <MessageSquare size={14} className="text-blue-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="text-center mt-10">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <MessageSquare size={18} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">No messages yet</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderRole === role;
                return (
                  <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] text-gray-400 mb-1 px-1 font-medium">
                      {msg.senderName}
                    </span>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm"
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-gray-300 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 text-gray-800 text-xs placeholder-gray-400 rounded-xl px-3 py-2.5 outline-none border border-gray-100 focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm shadow-blue-200/50"
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className="bg-white border-t border-gray-100 px-8 py-3.5 flex items-center justify-between shrink-0">

        {/* Left */}
        <div className="w-48">
          <p className="text-xs font-semibold text-gray-800">
            {isHR ? "HR Interview Room" : "Developer Interview Room"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
            {connected ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Waiting...
              </span>
            )}
            {remoteSharing && (
              <span className="ml-2 text-blue-500 font-medium">· Screen share active</span>
            )}
          </p>
        </div>

        {/* Center */}
        <div className="flex items-center gap-2.5">

          {/* Mute */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isMuted
                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            {isMuted
              ? <MicOff size={17} />
              : <Mic    size={17} />
            }
          </button>

          {/* Video */}
          <button
            onClick={toggleVideo}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isVideoOff
                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            {isVideoOff
              ? <VideoOff size={17} />
              : <Video    size={17} />
            }
          </button>

          {/* Screen share */}
          <button
            onClick={toggleScreenShare}
            title={isSharing ? "Stop sharing" : "Share screen"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
              isSharing
                ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            <Monitor size={17} />
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            title="End call"
            className="w-11 h-11 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors text-white shadow-sm shadow-red-200/50"
          >
            <PhoneOff size={17} />
          </button>
        </div>

        {/* Right */}
        <div className="w-48 flex justify-end">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 border ${
              showChat
                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200/50"
                : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            <MessageSquare size={14} />
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}