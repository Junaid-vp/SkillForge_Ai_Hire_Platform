import { useState, useEffect } from "react";
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  CalendarDays, 
  MessageSquare, 
  Inbox,
  Clock
} from "lucide-react";
import { api } from "../../Api/Axios";
import toast from "react-hot-toast";
import ClearAllNotifModal from "../Components/Mod/ClearAllNotifModal";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const normalizeType = (type: string) => {
  if (type.startsWith("INTERVIEW")) return "INTERVIEW";
  if (type.startsWith("TASK")) return "TASK";
 
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/notification");
      setNotifications(res.data.data);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notification/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notifications_updated'));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const clearAll = async () => {
    setIsClearing(true);
    try {
      await api.delete("/notification/clear-all");
      setNotifications([]);
      window.dispatchEvent(new Event('notifications_updated'));
      toast.success("Notification history cleared");
      setIsClearModalOpen(false);
    } catch (err) {
      toast.error("Failed to clear history");
    } finally {
      setIsClearing(false);
    }
  };

  const deleteOne = async (id: string) => {
    try {
      await api.delete(`/notification/delete/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new Event('notifications_updated'));
      toast.success("Deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INTERVIEW": return <CalendarDays size={14} className="text-blue-500" />;
      case "TASK": return <MessageSquare size={14} className="text-green-500" />;
     
      default: return <Bell size={14} className="text-gray-400" />;
    }
  };

  const filtered = activeFilter === "ALL" 
    ? notifications 
    : notifications.filter(n => normalizeType(n.type) === activeFilter);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Bell size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Activity Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Stay updated with your latest interview activities and system alerts
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-100 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <CheckCircle2 size={13} /> Mark all read
          </button>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-50 hover:bg-red-50 text-red-500 text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Trash2 size={13} /> Clear all
          </button>
        </div>
      </div>

      <ClearAllNotifModal 
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={clearAll}
        isLoading={isClearing}
      />

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          {["ALL", "INTERVIEW", "TASK"].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-[11px] font-bold transition-all px-1 py-0.5 border-b-2 ${
                activeFilter === filter 
                ? "text-blue-600 border-blue-600" 
                : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-gray-400">Loading your activity...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-gray-700">No Notifications</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilter === "ALL" ? "Your inbox is empty" : `No notifications in ${activeFilter}`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(notif => (
              <div 
                key={notif.id}
                onClick={() => !notif.isRead && api.patch(`/notification/${notif.id}/mark-read`).then(() => { setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)); window.dispatchEvent(new Event('notifications_updated')); })}
                className={`p-6 flex items-start gap-5 transition-all hover:bg-gray-50/80 group relative ${!notif.isRead ? "bg-blue-50/20" : ""}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  !notif.isRead ? "bg-white border border-blue-100" : "bg-gray-50"
                }`}>
                  {getTypeIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm tracking-tight ${!notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                        <Clock size={11} />
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOne(notif.id);
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-lg border border-transparent shadow-sm opacity-0 group-hover:opacity-100 hover:border-red-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
