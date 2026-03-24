import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../Api/Axios";
import {
  Sparkles,
  PlusCircle,
  BookOpen,
  CalendarDays,
  Code2,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart2,
  Users,
} from "lucide-react";

interface DashboardStats {
  totalDevelopers: number;
  totalTasks: number;
  scheduledInterviews: number;
  completedInterviews: number;
}

const fetchStats = async (): Promise<DashboardStats> => {
  const [devsRes, tasksRes, interviewsRes] = await Promise.all([
    api.get("/interview/developers"),
    api.get("/tasklibary/alltask"),
    api.get("/interview/interviews"),
  ]);

  const developers = devsRes.data.data ?? [];
  const tasks = tasksRes.data.data ?? [];
  const interviews = interviewsRes.data.data ?? [];

  return {
    totalDevelopers: developers.length,
    totalTasks: tasks.length,
    scheduledInterviews: interviews.filter(
      (i: { status: string }) => i.status === "SCHEDULED"
    ).length,
    completedInterviews: interviews.filter(
      (i: { status: string }) => i.status === "COMPLETED"
    ).length,
  };
};

const statCards = [
  {
    key: "totalDevelopers",
    label: "Developers Invited",
    icon: <Users size={16} className="text-blue-500" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
    valueColor: "text-blue-700",
  },
  {
    key: "totalTasks",
    label: "Tasks in Library",
    icon: <BookOpen size={16} className="text-purple-500" />,
    bg: "bg-purple-50",
    border: "border-purple-100",
    valueColor: "text-purple-700",
  },
  {
    key: "scheduledInterviews",
    label: "Scheduled Interviews",
    icon: <Clock size={16} className="text-yellow-500" />,
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    valueColor: "text-yellow-700",
  },
  {
    key: "completedInterviews",
    label: "Completed Interviews",
    icon: <CheckCircle2 size={16} className="text-green-500" />,
    bg: "bg-green-50",
    border: "border-green-100",
    valueColor: "text-green-700",
  },
];

const quickActions = [
  {
    label: "Create Interview",
    description: "Invite a developer and schedule an interview",
    icon: <PlusCircle size={18} className="text-blue-600" />,
    path: "/dashboard/create-interview",
    accent: "border-blue-100 hover:border-blue-300",
    iconBg: "bg-blue-50",
  },
  {
    label: "Task Library",
    description: "Browse and manage your task templates",
    icon: <BookOpen size={18} className="text-purple-600" />,
    path: "/dashboard/task-library",
    accent: "border-purple-100 hover:border-purple-300",
    iconBg: "bg-purple-50",
  },
  {
    label: "Interview Schedule",
    description: "View all upcoming and past interviews",
    icon: <CalendarDays size={18} className="text-yellow-600" />,
    path: "/dashboard/schedule",
    accent: "border-yellow-100 hover:border-yellow-300",
    iconBg: "bg-yellow-50",
  },
  {
    label: "Developers",
    description: "View invited developers and their progress",
    icon: <Code2 size={18} className="text-green-600" />,
    path: "/dashboard/developers",
    accent: "border-green-100 hover:border-green-300",
    iconBg: "bg-green-50",
  },
  {
    label: "Reports",
    description: "Analyse hiring metrics and trends",
    icon: <BarChart2 size={18} className="text-red-500" />,
    path: "/dashboard/reports",
    accent: "border-red-100 hover:border-red-300",
    iconBg: "bg-red-50",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["DashboardStats"],
    queryFn: fetchStats,
  });

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            HR Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back — here's what's happening today
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`bg-white border ${card.border} rounded-2xl shadow-sm px-5 py-4`}
          >
            <div className={`w-8 h-8 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            {isLoading ? (
              <div className="h-6 w-12 bg-gray-100 rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-bold ${card.valueColor}`}>
                {stats ? stats[card.key as keyof DashboardStats] : 0}
              </p>
            )}
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`group flex items-center gap-4 bg-white border ${action.accent} rounded-2xl shadow-sm px-5 py-4 text-left transition-all duration-200 hover:shadow-md`}
            >
              <div
                className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center shrink-0`}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {action.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {action.description}
                </p>
              </div>
              <ArrowRight
                size={15}
                className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
