import { CalendarDays, Shield, MessageSquare, Clock } from "lucide-react";
import { SectionCard, InfoRow, Badge, EmptyCard } from "./SectionCard";
import { type Interview, STATUS_STYLES, formatDate } from "../Types/developer.types";

export function InterviewSection({ interview }: { interview: Interview | null }) {
  if (!interview) {
    return (
      <SectionCard
        icon={<CalendarDays size={13} className="text-blue-600" />}
        title="Interview Details"
        subtitle="Scheduled interview information"
      >
        <EmptyCard message="No interview scheduled yet." />
      </SectionCard>
    );
  }

  const statusStyle = STATUS_STYLES[interview.status] ?? STATUS_STYLES.PENDING;

  return (
    <SectionCard
      icon={<CalendarDays size={13} className="text-blue-600" />}
      title="Interview Details"
      subtitle="Scheduled interview information"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
        {interview.scheduledAt && (
          <InfoRow
            icon={<CalendarDays size={13} className="text-gray-400" />}
            label="Scheduled At"
            value={formatDate(interview.scheduledAt)}
          />
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <Shield size={13} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">Status</p>
            <Badge label={interview.status} style={statusStyle} />
          </div>
        </div>
      </div>

      {/* Interview Feedback — coming soon */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <MessageSquare size={11} /> Interview Feedback
        </p>
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-5 py-6 flex flex-col items-center gap-2 text-center">
          <div className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
            <Clock size={15} className="text-gray-300" />
          </div>
          <p className="text-xs font-semibold text-gray-500">Feedback not available yet</p>
          <p className="text-[11px] text-gray-400 max-w-xs">
            Interview feedback will appear here once the HR completes the evaluation. Coming in the next update.
          </p>
          <span className="mt-1 text-[10px] font-semibold bg-blue-50 border border-blue-100 text-blue-500 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Coming Soon
          </span>
        </div>
      </div>
    </SectionCard>
  );
}