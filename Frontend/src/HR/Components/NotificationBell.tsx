import { useState, useEffect, useRef } from "react"
import { Bell, CheckCheck, Calendar, FileCode2, Brain, Clock, Ban, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { api } from "../../Api/Axios"
import { getSocket } from "../../Service/socket"
import toast from "react-hot-toast"

interface Notification {
  id:        string
  title:     string
  message:   string
  type:      string
  isRead:    boolean
  createdAt: string
}

const typeIcon = (type: string) => {
  if (type === "INTERVIEW_SCHEDULED" || type === "INTERVIEW_RESCHEDULED") return <Calendar size={13} className="text-blue-500" />
  if (type === "INTERVIEW_CANCELLED") return <Ban size={13} className="text-red-500" />
  if (type === "TASK_SUBMITTED") return <FileCode2 size={13} className="text-green-500" />
  if (type === "TASK_EVALUATED") return <Brain size={13} className="text-purple-500" />
  if (type === "TASK_EXPIRED") return <AlertCircle size={13} className="text-amber-500" />
  return <Bell size={13} className="text-gray-400" />
}

const typeColor = (type: string) => {
  if (type === "INTERVIEW_SCHEDULED" || type === "INTERVIEW_RESCHEDULED") return "bg-blue-50 border-blue-100"
  if (type === "INTERVIEW_CANCELLED") return "bg-red-50 border-red-100"
  if (type === "TASK_SUBMITTED") return "bg-green-50 border-green-100"
  if (type === "TASK_EVALUATED") return "bg-purple-50 border-purple-100"
  if (type === "TASK_EXPIRED") return "bg-amber-50 border-amber-100"
  return "bg-gray-50 border-gray-100"
}

interface Props {
  hrId: string
}

export default function NotificationBell({ hrId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()

    const socket = getSocket()
    // Join HR personal socket room
    socket.emit("join-hr-notification", hrId)



    socket.on("notification", (notification: Notification & { silent?: boolean }) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)

    if (notification.silent) return
      toast(() => (
        <div className="flex flex-col gap-1">
          <p className="font-bold text-xs">{notification.title}</p>
          <p className="text-[11px] text-gray-500">{notification.message}</p>
        </div>
      ), { icon: '🔔' })
    })
    return () => {
      socket.off("notification")
    }
  }, [hrId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notification")
      const allNotifs = res.data.data
      setNotifications(allNotifs)
      setUnreadCount(allNotifs.filter((n: Notification) => !n.isRead).length)
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notification/mark-all-read")
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      window.dispatchEvent(new Event('notifications_updated'));
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkOneRead = async (id: string) => {
    try {
      await api.patch(`/notification/${id}/mark-read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (e) {
      console.log(e)
    }
  }

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
      >
        <Bell size={16} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] px-0.5 shadow-sm border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <CheckCheck size={11} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-none">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <p className="text-[11px] font-medium text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-4 border-b border-gray-50 transition-colors cursor-pointer hover:bg-gray-50/80 ${
                    !n.isRead ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${typeColor(n.type)}`}>
                    {typeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[11px] leading-tight ${
                        n.isRead ? "text-gray-600 font-medium" : "font-bold text-gray-900"
                      }`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-gray-500 mt-1 leading-relaxed break-words">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-300 mt-2 uppercase tracking-wider">
                      <Clock size={10} />
                      {formatTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 bg-gray-50/50 border-t border-gray-50">
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate("/dashboard/notifications");
              }}
              className="w-full py-2 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-all"
            >
              View All Activity
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
