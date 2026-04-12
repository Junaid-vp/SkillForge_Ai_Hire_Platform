// src/Pages/InterviewRoom/panels/ChatPanel.tsx

import { useRef, useEffect } from "react"
import { Send, MessageSquare } from "lucide-react"
import { getSocket } from "../../../Service/socket"
import type { ChatMessage } from "../Types"

interface Props {
  messages:      ChatMessage[]
  newMessage:    string
  setNewMessage: (v: string) => void
  role:          string
  userName:      string
  interviewId:   string
}

export default function ChatPanel({
  messages, newMessage, setNewMessage,
  role, userName, interviewId
}: Props) {

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return
    getSocket().emit("send-message", {
      interviewId,
      message:    newMessage.trim(),
      senderName: userName,
      senderRole: role,
    })
    setNewMessage("")
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Messages list */}
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
          const isMe = msg.senderRole === role
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
                {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 text-gray-800 text-xs placeholder-gray-400
            rounded-xl px-3 py-2.5 outline-none border border-gray-100
            focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40
            rounded-xl flex items-center justify-center shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}