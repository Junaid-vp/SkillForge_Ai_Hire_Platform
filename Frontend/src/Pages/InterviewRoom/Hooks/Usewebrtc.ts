// src/Pages/InterviewRoom/hooks/useWebRTC.ts

import { useRef, useState, useEffect, useCallback } from "react"
import Peer from "peerjs"
import { getSocket, disconnectSocket } from "../../../Service/socket"

export function useWebRTC(interviewId: string, isHR: boolean, navigate: (path: string) => void) {

  // ── Refs ────────────────────────────────────────────────────────────────
  const localVideoRef           = useRef<HTMLVideoElement>(null)
  const remoteVideoRef          = useRef<HTMLVideoElement>(null)
  const remoteScreenRef         = useRef<HTMLVideoElement>(null)
  const peerRef                 = useRef<Peer | null>(null)
  const screenPeerRef           = useRef<Peer | null>(null)
  const streamRef               = useRef<MediaStream | null>(null)
  const screenStreamRef         = useRef<MediaStream | null>(null)
  const incomingVideoStreamRef  = useRef<MediaStream | null>(null)
  const incomingScreenStreamRef = useRef<MediaStream | null>(null)

  // ── State ────────────────────────────────────────────────────────────────
  const [connected,     setConnected]     = useState(false)
  const [remoteSharing, setRemoteSharing] = useState(false)
  const [isSharing,     setIsSharing]     = useState(false)
  const [isMuted,       setIsMuted]       = useState(false)
  const [isVideoOff,    setIsVideoOff]    = useState(false)
  const [camError,      setCamError]      = useState(false)

  // ── Re-attach video streams after code editor closes ────────────────────
  const reattachStreams = useCallback(() => {
    setTimeout(() => {
      if (localVideoRef.current && streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current
        localVideoRef.current.play().catch(() => {})
      }
      if (remoteVideoRef.current && incomingVideoStreamRef.current) {
        remoteVideoRef.current.srcObject = incomingVideoStreamRef.current
        remoteVideoRef.current.play().catch(() => {})
      }
      if (remoteScreenRef.current && incomingScreenStreamRef.current) {
        remoteScreenRef.current.srcObject = incomingScreenStreamRef.current
        remoteScreenRef.current.play().catch(() => {})
      }
    }, 100)
  }, [])

  // ── Main WebRTC setup ────────────────────────────────────────────────────
  useEffect(() => {
    if (!interviewId) return
    const socket = getSocket()

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        const peer = new Peer()
        peerRef.current = peer

        peer.on("open", (myPeerId) => {
          socket.emit("join-room", { interviewId, role: isHR ? "HR" : "Developer" })
          socket.emit("send-peer-id", { interviewId, peerId: myPeerId })
        })

        // Someone calling us — answer with our stream
        peer.on("call", (call) => {
          call.answer(streamRef.current || stream)
          call.on("stream", (remoteStream) => {
            incomingVideoStreamRef.current = remoteStream
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
              setTimeout(() => remoteVideoRef.current?.play().catch(() => {}), 100)
            }
            setConnected(true)
          })
        })

        // We received their peerId — call them
        socket.on("receive-peer-id", (remotePeerId: string) => {
          const call = peer.call(remotePeerId, streamRef.current || stream)
          call.on("stream", (remoteStream) => {
            incomingVideoStreamRef.current = remoteStream
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
              setTimeout(() => remoteVideoRef.current?.play().catch(() => {}), 100)
            }
            setConnected(true)
          })
        })

        // Screen share incoming
        socket.on("receive-screen-peer-id", (screenPeerId: string) => {
          const screenCall = peer.call(screenPeerId, stream)
          screenCall.on("stream", (incomingScreenStream) => {
            incomingScreenStreamRef.current = incomingScreenStream
            setRemoteSharing(true)
          })
          screenCall.on("error", (err) => console.error("Screen call error:", err))
        })

        socket.on("screen-share-stopped", () => {
          setRemoteSharing(false)
          incomingScreenStreamRef.current = null
          if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null
        })

        // Other person disconnected — don't auto-kick, wait for rejoin
        socket.on("user-left", () => {
          setConnected(false)
          setRemoteSharing(false)
          if (remoteVideoRef.current)  remoteVideoRef.current.srcObject  = null
          if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null
        })

        // Other person ended call explicitly — redirect after 3s
        socket.on("end-call-explicitly", () => {
          setTimeout(() => {
            streamRef.current?.getTracks().forEach((t) => t.stop())
            screenStreamRef.current?.getTracks().forEach((t) => t.stop())
            peerRef.current?.destroy()
            screenPeerRef.current?.destroy()
            disconnectSocket()
            navigate(isHR ? "/dashboard" : "/devDashboard")
          }, 3000)
        })
      })
      .catch((err) => {
        console.error("Camera error:", err)
        setCamError(true)
      })

    // Assign screen stream to video element when it mounts
    return () => {
      socket.off("receive-peer-id")
      socket.off("receive-screen-peer-id")
      socket.off("screen-share-stopped")
      socket.off("user-left")
      socket.off("end-call-explicitly")
    }
  }, [interviewId, isHR, navigate])

  // Assign incoming screen stream once video element mounts
  useEffect(() => {
    if (remoteSharing && remoteScreenRef.current && incomingScreenStreamRef.current) {
      remoteScreenRef.current.srcObject = incomingScreenStreamRef.current
    }
  }, [remoteSharing])

  // ── Media controls ───────────────────────────────────────────────────────
  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0]
    if (track) { track.enabled = !track.enabled; setIsMuted(p => !p) }
  }

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (track) { track.enabled = !track.enabled; setIsVideoOff(p => !p) }
  }

  const startScreenShare = async () => {
    const socket = getSocket()
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      screenStreamRef.current = screenStream

      const screenPeer = new Peer()
      screenPeerRef.current = screenPeer

      screenPeer.on("open", (screenPeerId) => {
        socket.emit("send-screen-peer-id", { interviewId, screenPeerId })
      })
      screenPeer.on("call", (call) => { call.answer(screenStream) })

      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream
      screenStream.getVideoTracks()[0].onended = () => stopScreenShare()
      setIsSharing(true)
    } catch {
      console.log("Screen share cancelled or denied")
    }
  }

  const stopScreenShare = () => {
    const socket = getSocket()
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current = null
    screenPeerRef.current?.destroy()
    screenPeerRef.current = null
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current
    }
    socket.emit("screen-share-stopped", interviewId)
    setIsSharing(false)
  }

  const toggleScreenShare = () => isSharing ? stopScreenShare() : startScreenShare()

  // ── Stop everything on endCall ───────────────────────────────────────────
  const stopAll = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    peerRef.current?.destroy()
    screenPeerRef.current?.destroy()
  }

  return {
    // Refs — passed to <video> elements
    localVideoRef,
    remoteVideoRef,
    remoteScreenRef,
    // State — used in UI
    connected,
    remoteSharing,
    isSharing,
    isMuted,
    isVideoOff,
    camError,
    // Functions
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    reattachStreams,
    stopAll,
  }
}