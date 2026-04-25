import { api } from "../../Api/Axios";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Clock, CheckCircle2, LogOut,
  User, Circle, Timer, Briefcase, BarChart2,
  CalendarDays, Building2, Video, BookOpen, Layers
} from "lucide-react";
import { FullScreenLoader } from "../../Context/ProtectedRoutes";
import { Logo } from "../../HR/Components/Icons";
import { useEffect, useState } from "react";
import ThankYouScreen from "../Components/ThankYouScreen";
import SubmitTaskModal from "../Components/SubmitTaskModal";

interface HR {
  name: string;
  email: string;
  companyName: string;
  companyWebsite: string;
}

interface Task {
  id: string;
  taskLibrary: {
    title: string;
    description: string;
    requirements: string;
    difficulty: string;
    duration: number;
    category: string;
    techStack: string;
  };
  deadline: string;
}

interface Interview {
  id: string;
  status: "SCHEDULED" | "STARTED" | "COMPLETED" | "CANCELLED";
  scheduledAt: string | null;
  createdAt: string;
  hr: HR;
  task: Task | null;
}

interface DevData {
  id: string;
  hrId: string;
  developerName: string;
  developerEmail: string;
  position: string;
  experience: number;
  interviewDate: string;
  interviewTime: string;
  uniqueCode: string;
  createdAt: string;
  interviews: Interview[];
}

const fetchDashBoard = async (): Promise<DevData> => {
  const res = await api.get("/dash/dev/dashboard");
  return res.data.dev;
};

const statusConfig: Record<
  string,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  SCHEDULED: {
    label: "Scheduled",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: <Circle size={9} />,
  },
  STARTED: {
    label: "In Progress",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: <Timer size={9} />,
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500",
    icon: <CheckCircle2 size={9} />,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-500",
    icon: <Circle size={9} />,
  },
};

const difficultyColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  easy: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  medium: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  hard: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  expert: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });



function DevDashBoard() {
  const navigate = useNavigate();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { clearAuth } = useAuth();
  const { data, isLoading, error } = useQuery<DevData>({
    queryKey: ["DevDashboard"],
    queryFn: fetchDashBoard,
  });
  const handleLogout = async () => {
    try {
      await api.post("/dev/logout");
      clearAuth();
      toast.success("Logged out successfully.");
    } catch (e) {
      
      clearAuth();
    } finally {
      navigate("/devLogin");
    }
  };

  const isJoinable = (scheduledAt: string) => {
    if (!scheduledAt) return false;
    const scheduledTime = new Date(scheduledAt);
    const now = new Date();

    // Allow join 10 minutes before scheduled time
    const tenMinsBefore = new Date(scheduledTime.getTime() - 10 * 60 * 1000);

    return now >= tenMinsBefore;
  };

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interview = data?.interviews?.[0];
    if (!interview?.scheduledAt) return;

    const interval = setInterval(() => {
      const scheduledTime = new Date(interview.scheduledAt as string);
      const now = new Date();

      const diff = scheduledTime.getTime() - now.getTime();

      if (Number.isNaN(diff)) {
        setTimeLeft("Pending Setup");
        return;
      }

      if (diff <= 0) {
        setTimeLeft("Started");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  if (submitted) return <ThankYouScreen />;
  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 border-b border-gray-100 bg-white/80 backdrop-blur-md h-16">
        <Logo />

        {data && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-800">
                {data.developerName}
              </p>
              <p className="text-[10px] text-gray-400">{data.position}</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[11px] font-bold">
              {data.developerName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-1"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Loading handled by FullScreenLoader */}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-white border border-red-100 rounded-2xl p-12 text-center">
              <p className="text-sm font-semibold text-red-500">
                Failed to load dashboard
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Please try again later
              </p>
            </div>
          )}

          {data &&
            (() => {
              const interview = data.interviews?.[0];
              const task = interview?.task ?? null;
              const status = interview ? statusConfig[interview.status] : null;
              const isScheduled = interview?.status === "SCHEDULED";
              const isStarted = interview?.status === "STARTED";
              const diff = task
                ? (difficultyColors[
                    task.taskLibrary.difficulty?.toLowerCase()
                  ] ?? difficultyColors["medium"])
                : null;

              return (
                <>
                  {/* Page Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                        Developer Portal
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Welcome,{" "}
                      {data.developerName?.split(" ")[0] || "Developer"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                      Here's your interview and task overview
                    </p>
                  </div>

                  {/* Profile Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-gray-50/60 border-b border-gray-100">
                      <User size={13} className="text-blue-600" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                        Profile
                      </p>
                    </div>
                    <div className="px-6 py-5 grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                          Full Name
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {data.developerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {data.developerEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                          Position
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                          <Briefcase size={11} className="text-gray-400" />
                          {data.position}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                          Experience
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                          <BarChart2 size={11} className="text-gray-400" />
                          {data.experience}{" "}
                          {data.experience === 1 ? "year" : "years"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interview Card */}
                  {interview && (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
                      <div className="flex items-center justify-between px-6 py-3 bg-gray-50/60 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <CalendarDays size={13} className="text-blue-600" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Interview Details
                          </p>
                        </div>
                        {status && (
                          <span
                            className={`inline-flex items-center gap-1 ${status.bg} border ${status.border} ${status.text} text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        )}
                      </div>
                      <div className="px-6 py-5 grid grid-cols-2 gap-5">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                            Date
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <CalendarDays size={11} className="text-blue-400" />
                            {interview.scheduledAt ? formatDate(interview.scheduledAt) : "N/A"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                            Time
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <Clock size={11} className="text-blue-400" />
                            {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                            HR
                          </p>
                          <p className="text-xs font-semibold text-gray-800">
                            {interview.hr.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                            Company
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <Building2 size={11} className="text-gray-400" />
                            {interview.hr.companyName}
                          </span>
                        </div>
                      </div>

                      {(isScheduled || isStarted) && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
                          {/* LEFT: Status */}
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">
                              Status
                            </span>
                            {isJoinable(
                               interview.scheduledAt || ""
                            ) ? (
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-green-600 tracking-wide">
                                  {isStarted ? "In Progress" : "Ready to join"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                <Timer size={12} className="text-gray-400" />
                                Starts in {timeLeft}
                              </div>
                            )}
                          </div>

                          {/* RIGHT: Button */}
                          <button
                            disabled={
                              !isJoinable(interview.scheduledAt || "")
                            }
                            onClick={() =>
                              navigate(
                                `/DevInterviewRoom/${interview.id}?role=Developer&name=${data.developerName}`,
                              )
                            }
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                          ${
                            isJoinable(interview.scheduledAt || "")
                              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                              : "bg-gray-100/80 text-gray-400 cursor-not-allowed border border-gray-200"
                          }`}
                          >
                            <Video size={14} />
                            {!isJoinable(interview.scheduledAt || "")
                              ? "You Can Join Before 10m"
                              : isStarted
                                ? "Rejoin Interview"
                                : "Join Interview"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Task Card */}
                  {task && diff ? (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
                      <div className="flex items-center gap-3 px-6 py-3 bg-gray-50/60 border-b border-gray-100">
                        <BookOpen size={13} className="text-blue-600" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                          Assigned Task
                        </p>
                      </div>
                      <div className="px-6 py-5 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-sm font-bold text-gray-900">
                              {task.taskLibrary.title}
                            </h2>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border} capitalize`}
                            >
                              {task.taskLibrary.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {task.taskLibrary.description}
                          </p>
                        </div>

                        {task.taskLibrary.requirements && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                              Requirements
                            </p>
                            <div className="space-y-2">
                              {(() => {
                                let reqs: string[] = [];
                                try {
                                  const parsed = JSON.parse(task.taskLibrary.requirements);
                                  reqs = Array.isArray(parsed) ? parsed : [parsed.toString()];
                                } catch {
                                  reqs = task.taskLibrary.requirements.split("|").filter(r => r.trim());
                                }
                                
                                return reqs.map((req, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                      {req.trim()}
                                    </p>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={11} className="text-gray-300" />
                            {task.taskLibrary.duration} day
                            {task.taskLibrary.duration !== 1 ? "s" : ""}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDays size={11} className="text-gray-300" />
                            Deadline: {formatDate(task.deadline)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <Layers size={11} className="text-gray-300" />
                            {task.taskLibrary.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {task.taskLibrary.techStack
                            ?.split(",")
                            .map((t, i) => (
                              <span
                                key={i}
                                className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-lg"
                              >
                                {t.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-50 bg-gray-50/40">
                        <button
                          onClick={() => setShowSubmitModal(true)}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700
  text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          Submit Task
                        </button>
                        <SubmitTaskModal
                          isOpen={showSubmitModal}
                          onClose={() => setShowSubmitModal(false)}
                          onSuccess={() => {
                            setShowSubmitModal(false);
                            setSubmitted(true);
                          }}
                          taskTitle={task?.taskLibrary?.title ?? ""}
                        />
                      </div>
                    </div>
                  ) : (
                    !isLoading && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <BookOpen size={18} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">
                          No task assigned yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Your HR will assign a task after the interview
                        </p>
                      </div>
                    )
                  )}
                </>
              );
            })()}
        </div>
      </main>
    </div>
  );
}

export default DevDashBoard;
