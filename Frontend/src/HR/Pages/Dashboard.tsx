import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../Api/Axios";
import { useAuth } from "../../Context/AuthContext";
import {
  PlusCircle, BookOpen, CalendarDays,
  Code2, ArrowRight, CheckCircle2, Clock, Users,
  Crown, X, ChevronRight, BellRing,
  Zap, BarChart3,
} from "lucide-react";
import { Logo } from "../Components/Icons";

interface DashboardStats {
  totalDevelopers:     number;
  totalTasks:          number;
  scheduledInterviews: number;
  completedInterviews: number;
}

interface Notification {
  id:        string;
  title:     string;
  message:   string;
  type:      string;
  isRead:    boolean;
  createdAt: string;
}

interface InterviewDetail {
  id:     string;
  status: string;
  scheduledAt: string;
  developerId: string;
  developer: {
    id:            string;
    developerName: string;
    position:      string;
    interviewTime: string;
    experience:    number;
  };
}

const fetchStats = async (): Promise<DashboardStats> => {
  const [devsRes, tasksRes, interviewsRes] = await Promise.all([
    api.get("/interview/developers"),
    api.get("/tasklibary/alltask"),
    api.get("/interview/interviews"),
  ]);
  const developers = devsRes.data.data       ?? [];
  const tasks      = tasksRes.data.data      ?? [];
  const interviews = interviewsRes.data.data ?? [];
  return {
    totalDevelopers:     developers.length,
    totalTasks:          tasks.length,
    scheduledInterviews: interviews.filter((i: any) => i.status === "SCHEDULED").length,
    completedInterviews: interviews.filter((i: any) => i.status === "COMPLETED").length,
  };
};

const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await api.get("/notification");
  return (res.data.data ?? []).slice(0, 6);
};

const fetchAllInterviews = async (): Promise<InterviewDetail[]> => {
  const res = await api.get("/interview/interviews");
  return res.data.data ?? [];
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const formatRelativeTime = (dateStr: string) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const format12Hour = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  if (!h || !m) return time24;
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
};

const formatMessageTime = (msg: string) => {
  if (!msg) return "";
  return msg.replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (_match, h, m) => {
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  });
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  SCHEDULED: { label: "Scheduled",   dot: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50"    },
  STARTED:   { label: "In Progress", dot: "bg-yellow-500",  text: "text-yellow-700",  bg: "bg-yellow-50"  },
  COMPLETED: { label: "Completed",   dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  CANCELLED: { label: "Cancelled",   dot: "bg-gray-400",    text: "text-gray-600",    bg: "bg-gray-50"    },
  SUSPENDED: { label: "Suspended",   dot: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50"     },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [banner, setBanner] = useState<"success" | "cancelled" | null>(null);
  const { hr } = useAuth();
  const queryClient = useQueryClient();

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notification/${id}/mark-read`);
      queryClient.setQueryData<Notification[]>(["DashboardRecentNotifications"], (old) =>
        (old ?? []).map((n) => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch { /* silent */ }
  };

  const { data: stats,         isLoading: statsLoading } = useQuery<DashboardStats>({ queryKey: ["DashboardStats"],               queryFn: fetchStats         });
  const { data: notifications, isLoading: notifLoading } = useQuery<Notification[]>({ queryKey: ["DashboardRecentNotifications"], queryFn: fetchNotifications });
  const { data: interviews,    isLoading: intLoading   } = useQuery<InterviewDetail[]>({ queryKey: ["DashboardRecentInterviews"], queryFn: fetchAllInterviews });

  const upcomingInterviews = (interviews ?? [])
    .filter((i) => i.status === "SCHEDULED")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  const recentInterviews = (interviews ?? [])
    .filter((i) => ["COMPLETED", "SUSPENDED", "CANCELLED"].includes(i.status))
    .slice(0, 3);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success")   { setBanner("success");   setSearchParams({}); }
    if (payment === "cancelled") { setBanner("cancelled"); setSearchParams({}); }
  }, []);

  const statCards = [
    { key: "totalDevelopers",     label: "Total Candidates", icon: <Users size={18} />,       bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100"   },
    { key: "totalTasks",          label: "Task Library",     icon: <BookOpen size={18} />,    bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
    { key: "scheduledInterviews", label: "Upcoming",         icon: <Clock size={18} />,       bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100"  },
    { key: "completedInterviews", label: "Completed",        icon: <CheckCircle2 size={18} />,bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100"},
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6 px-1">

      {/* Payment banner */}
      {banner && (
        <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border ${
          banner === "success" ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${banner === "success" ? "bg-emerald-100" : "bg-gray-100"}`}>
              {banner === "success" ? <Crown size={17} className="text-emerald-600" /> : <X size={17} className="text-gray-500" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{banner === "success" ? "Welcome to Pro! 🎉" : "Payment Cancelled"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{banner === "success" ? "All premium features are now unlocked." : "No charges were made."}</p>
            </div>
          </div>
          <button onClick={() => setBanner(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <Logo className="mb-2" size={24} textSize="text-[13px]" subTextSize="text-[7px]" />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {getGreeting()}, <span className="text-blue-600">{hr?.name ?? "Team"}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {statsLoading ? (
              <span className="inline-block h-4 w-44 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>You have <span className="font-semibold text-gray-700">{stats?.scheduledInterviews ?? 0} interview{stats?.scheduledInterviews !== 1 ? "s" : ""}</span> scheduled</>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/create-interview")}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-gray-900/10 active:scale-95 shrink-0"
        >
          <PlusCircle size={15} /> New Interview
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className={`relative bg-white rounded-xl p-5 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex items-center border border-gray-100/80 overflow-hidden z-0 group`}>
            
            {/* Premium Ambient Glow on Hover */}
            <div className={`absolute -top-8 -right-8 w-32 h-32 opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500 blur-2xl rounded-full ${card.bg}`} />
            
            <div className="flex items-center gap-4 z-10">
              <div className={`w-10 h-10 ${card.bg} ${card.text} rounded-lg flex items-center justify-center shrink-0 border border-white/50 shadow-sm transition-transform duration-300 group-hover:scale-[1.05]`}>
                {card.icon}
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-lg font-bold text-gray-800 leading-none">
                  {statsLoading
                    ? <span className="inline-block w-6 h-5 bg-gray-50 rounded animate-pulse" />
                    : (stats?.[card.key as keyof DashboardStats] ?? 0)
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Upcoming interviews */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarDays size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Upcoming Interviews</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Scheduled sessions</p>
              </div>
            </div>
            <button onClick={() => navigate("/dashboard/schedule")} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              View all <ChevronRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {intLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="w-10 h-10" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-36" /><Skeleton className="h-2.5 w-24" /></div>
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ))
            ) : upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                      {getInitials(interview.developer.developerName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {interview.developer.developerName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {interview.developer.position}{interview.developer.experience ? ` · ${interview.developer.experience}y exp` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800">{formatDate(interview.scheduledAt)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{format12Hour(interview.developer.interviewTime)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/dashboard/devFullDetails/${interview.developer?.id ?? interview.id}`)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No upcoming interviews</p>
                <p className="text-xs text-gray-400 mt-1">Your schedule is clear</p>
                <button onClick={() => navigate("/dashboard/create-interview")} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  + Schedule one now
                </button>
              </div>
            )}
          </div>

          {/* Recent completed */}
          {!intLoading && recentInterviews.length > 0 && (
            <>
              <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recent Activity</p>
              </div>
              <div className="divide-y divide-gray-50">
                {recentInterviews.map((interview) => {
                  const s = statusConfig[interview.status] ?? statusConfig.COMPLETED;
                  return (
                    <div key={interview.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-[10px] font-black shrink-0">
                          {getInitials(interview.developer.developerName)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{interview.developer.developerName}</p>
                          <p className="text-[10px] text-gray-400">{interview.developer.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        <button onClick={() => navigate("/dashboard/reports")} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BellRing size={15} className="text-blue-600" />
              <p className="text-xs font-black text-gray-900 uppercase tracking-[0.15em]">Activity</p>
            </div>
            {(notifications ?? []).filter((n) => !n.isRead).length > 0 && (
              <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {notifications!.filter((n) => !n.isRead).length} new
              </span>
            )}
          </div>

          <div className="flex-1 space-y-1">
            {notifLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-3 py-3 rounded-xl bg-gray-50 animate-pulse">
                  <div className="h-2.5 w-24 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              ))
            ) : (notifications ?? []).length > 0 ? (
              notifications!.map((notif) => (
                <div key={notif.id} onClick={() => !notif.isRead && handleMarkRead(notif.id)} className={`px-3 py-3 rounded-xl transition-colors group ${notif.isRead ? "hover:bg-gray-50/80 cursor-default" : "bg-blue-50 hover:bg-blue-100/50 cursor-pointer"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{formatRelativeTime(notif.createdAt)}</p>
                    {!notif.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-700 group-hover:text-gray-900 leading-snug transition-colors">{notif.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 group-hover:text-gray-500 transition-colors">{formatMessageTime(notif.message)}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                  <BellRing size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you here</p>
              </div>
            )}
          </div>

          <button onClick={() => navigate("/dashboard/notifications")} className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-gray-100">
            View all notifications
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Task Library",   desc: "Manage assessment templates", icon: <BookOpen size={18} />, path: "/dashboard/task-library", bg: "bg-violet-50", text: "text-violet-600" },
          { label: "Developer Pool", desc: "Track all candidates",         icon: <Code2 size={18} />,    path: "/dashboard/developers",   bg: "bg-emerald-50",text: "text-emerald-600"},
          { label: "Reports",        desc: "Interview reports & analytics",icon: <BarChart3 size={18} />,path: "/dashboard/reports",      bg: "bg-amber-50",  text: "text-amber-600" },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all group text-left"
          >
            <div className={`w-10 h-10 ${action.bg} ${action.text} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ring-4 ring-white shadow-sm`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{action.desc}</p>
            </div>
            <ArrowRight size={14} className="text-gray-200 group-hover:text-gray-700 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}