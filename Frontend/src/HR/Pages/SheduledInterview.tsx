import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../Api/Axios";
import {
  CalendarDays,
  Clock,
  Briefcase,
  CheckCircle2,
  Check,
  Circle,
  Timer,
  Video,
  RotateCcw,
  LinkIcon,
  Copy
} from "lucide-react";
import RescheduleModal from "../Components/Mod/ResheduledModal";
import { useState } from "react";

type InterviewStatus = "SCHEDULED" | "STARTED" | "COMPLETED" | "CANCELLED";

interface ScheduledDetails {
  id: string;
  createdAt: Date;
  hrId: string;
  developerId: string;
  status: InterviewStatus;
  scheduledAt: Date | null;
  developer: {
    id: string;
    createdAt: Date;
    hrId: string;
    developerEmail: string;
    developerName: string;
    experience: number;
    interviewDate: Date;
    interviewTime: string;
    position: string;
    uniqueCode: string;
  };
}

const fetchScheduledInterview = async () => {
  const res = await api.get("/interview/interviews");
  return res.data.data ?? [];
};

const formatDate = (date: Date | null) => {
  if (!date) return "Date not set";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
const formatTime = (t: string) => {
  if (!t?.includes(":")) return t;
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const statusConfig: Record<
  InterviewStatus,
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

function ScheduledInterview() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<ScheduledDetails[]>({
    queryKey: ["ScheduledInterview"],
    queryFn: fetchScheduledInterview,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedInterviewId, setCopiedInterviewId] = useState<string | null>(
    null,
  );

  const handleCopyCode = async (code: string, interviewId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedInterviewId(interviewId);
      window.setTimeout(() => {
        setCopiedInterviewId((current) =>
          current === interviewId ? null : current,
        );
      }, 1500);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <RescheduleModal
        open={openModal}
        interviewId={selectedId || ""}
        onClose={() => setOpenModal(false)}
        refetch={() =>
          queryClient.invalidateQueries({ queryKey: ["ScheduledInterview"] })
        }
      />
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <CalendarDays size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            HR Portal
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Interview Schedule
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View and manage upcoming technical interviews
            </p>
          </div>
          {data && data.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-semibold text-blue-600">
                  {data.filter((d) => d.status === "SCHEDULED").length}{" "}
                  Scheduled
                </span>
              </div>
              <div className="bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-semibold text-green-600">
                  {data.filter((d) => d.status === "COMPLETED").length}{" "}
                  Completed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-48" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-100 rounded-xl w-28" />
                  <div className="h-8 bg-gray-100 rounded-xl w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-red-500">
            Failed to load interviews
          </p>
          <p className="text-xs text-gray-400 mt-1">Please try again later</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && data && data.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={20} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            No interviews scheduled yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Create an interview to get started
          </p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((interview) => {
            const s = statusConfig[interview.status];
            const isCompleted = interview.status === "COMPLETED";
            const isCancelled = interview.status === "CANCELLED";
            const isStarted = interview.status === "STARTED";

            return (
              <div
                key={interview.id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md
                  ${isCompleted || isCancelled ? "border-gray-100 opacity-70" : "border-gray-100 hover:border-gray-200"}`}
              >
                <div className="flex items-center justify-between px-6 py-5">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                      ${isCompleted || isCancelled ? "bg-gray-200" : isStarted ? "bg-green-500" : "bg-blue-600"}`}
                    >
                      <span className="text-white text-sm font-bold">
                        {interview.developer.developerName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>

                    <div>
                      {/* Name + badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          {interview.developer.developerName}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 ${s.bg} border ${s.border} ${s.text} text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide`}
                        >
                          {s.icon}
                          {s.label}
                        </span>
                      </div>

                      {/* Position */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Briefcase size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {interview.developer.position}
                        </span>
                      </div>
                     
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <LinkIcon size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {interview.developer.uniqueCode}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopyCode(
                              interview.developer.uniqueCode,
                              interview.id,
                            )
                          }
                          title={
                            copiedInterviewId === interview.id
                              ? "Code copied"
                              : "Copy code"
                          }
                          aria-label={
                            copiedInterviewId === interview.id
                              ? "Code copied"
                              : "Copy code"
                          }
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          {copiedInterviewId === interview.id ? (
                            <Check size={13} className="text-green-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>

                        
                      {/* Date · Time */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarDays size={11} className="text-gray-300" />
                        <span>
                          {formatDate(interview.developer.interviewDate)}
                        </span>
                        <span className="mx-1 text-gray-200">·</span>
                        <Clock size={11} className="text-gray-300" />
                        <span>
                          {formatTime(interview.developer.interviewTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right — actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {interview.status === "SCHEDULED" && (
                      <>
                        <button
                          onClick={() => {
                            /* join interview */
                          }}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          <Video size={13} />
                          Join Interview
                        </button>
                        <button
                          onClick={() => {
                            setSelectedId(interview.id);
                            setOpenModal(true);
                          }}
                          className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          <RotateCcw size={12} />
                          Reschedule
                        </button>
                      </>
                    )}

                    {interview.status === "STARTED" && (
                      <button
                        onClick={() => {
                          /* rejoin */
                        }}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        <Video size={13} />
                        Rejoin Interview
                      </button>
                    )}

                    {isCompleted && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <CheckCircle2 size={14} className="text-green-500" />
                        Interview Completed
                      </span>
                    )}

                    {isCancelled && (
                      <span className="text-xs text-red-400 font-medium">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterview;
