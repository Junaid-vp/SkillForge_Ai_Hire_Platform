import { api } from "../../Api/Axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  User,
  Briefcase,
  CalendarDays,
  Clock,
  Building2,
  BarChart2,
  Video,
 
  CheckCircle2,
  Circle,
  Timer,
  BookOpen,
  Layers,
  LogOut,
} from "lucide-react";

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
  { label: string; bg: string; border: string; text: string; icon: React.ReactNode }
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

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  medium: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
  hard: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  expert: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (t: string) => {
  if (!t?.includes(":")) return t;
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

function DevDashBoard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery<DevData>({
    queryKey: ["DevDashboard"],
    queryFn: fetchDashBoard,
  });
  const handleLogout = async () => {
    try {
      await api.post("/dev/logout");
    } catch (e) {
      console.log(e);
    } finally {
      navigate("/devLogin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 border-b border-gray-100 bg-white/80 backdrop-blur-md h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">SkillForge AI</span>
        </div>

        {data && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-800">{data.developerName}</p>
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

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              <div className="h-7 bg-gray-100 rounded w-48 animate-pulse mb-8" />
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-white border border-red-100 rounded-2xl p-12 text-center">
              <p className="text-sm font-semibold text-red-500">Failed to load dashboard</p>
              <p className="text-xs text-gray-400 mt-1">Please try again later</p>
            </div>
          )}

          {data && (() => {
            const interview = data.interviews?.[0];
            const task = interview?.task ?? null;
            const status = interview ? statusConfig[interview.status] : null;
            const isScheduled = interview?.status === "SCHEDULED";
            const isStarted = interview?.status === "STARTED";
            const diff = task
              ? difficultyColors[task.taskLibrary.difficulty?.toLowerCase()] ?? difficultyColors["medium"]
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
                    Welcome, {data.developerName?.split(" ")[0] || "Developer"}
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
                      <p className="text-sm font-semibold text-gray-800">{data.developerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{data.developerEmail}</p>
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
                        {data.experience} {data.experience === 1 ? "year" : "years"}
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
                          {formatDate(data.interviewDate)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                          Time
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <Clock size={11} className="text-blue-400" />
                          {formatTime(data.interviewTime)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                          HR
                        </p>
                        <p className="text-xs font-semibold text-gray-800">{interview.hr.name}</p>
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
                      <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-50 bg-gray-50/40">
                        <button
                          onClick={() => { navigate(`/DevInterviewRoom/${interview.id}?role=Developer&name=${data.developerName}`)}}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-100"
                        >
                          <Video size={13} />
                          {isStarted ? "Rejoin Interview" : "Join Interview"}
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
                          <h2 className="text-sm font-bold text-gray-900">{task.taskLibrary.title}</h2>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border} capitalize`}
                          >
                            {task.taskLibrary.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{task.taskLibrary.description}</p>
                      </div>

                      {task.taskLibrary.requirements && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Requirements</p>
                          <div className="space-y-2">
                            {task.taskLibrary.requirements.split("|").filter(r => r.trim()).map((req, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <p className="text-xs text-gray-600 leading-relaxed">{req.trim()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={11} className="text-gray-300" />
                          {task.taskLibrary.duration} day{task.taskLibrary.duration !== 1 ? "s" : ""}
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
                        {task.taskLibrary.techStack?.split(",").map((t, i) => (
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
                        onClick={() => { /* submit task */ }}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-green-100"
                      >
                        <CheckCircle2 size={13} />
                        Submit Task
                      </button>
                    </div>
                  </div>
                ) : (
                  !isLoading && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <BookOpen size={18} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">No task assigned yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Your HR will assign a task before the interview
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