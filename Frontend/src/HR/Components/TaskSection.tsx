import { ClipboardList, BookOpen, CheckCircle2, Timer, Cpu, Tag, BarChart2, Clock } from "lucide-react";
import { SectionCard, Badge, EmptyCard } from "./SectionCard";
import { type Task, STATUS_STYLES, DIFFICULTY_STYLES, formatDate } from"../Types/developer.types";

export function TaskSection({ task }: { task: Task | null }) {
  if (!task || !task.taskLibrary) {
    return (
      <SectionCard
        icon={<ClipboardList size={13} className="text-blue-600" />}
        title="Assigned Task"
        subtitle="Technical task assigned to the candidate"
      >
        <EmptyCard message="No task assigned yet." />
      </SectionCard>
    );
  }

  const lib             = task.taskLibrary;
  const taskStatusStyle = STATUS_STYLES[task.status]                  ?? STATUS_STYLES.PENDING;
  const difficultyStyle = DIFFICULTY_STYLES[lib.difficulty.toUpperCase()] ?? DIFFICULTY_STYLES.MEDIUM;
  const techStackList   = lib.techStack.split(",").map((t) => t.trim()).filter(Boolean);

  let requirements: string[] = [];
  try {
    const parsed = JSON.parse(lib.requirements);
    requirements = Array.isArray(parsed) ? parsed : [lib.requirements];
  } catch {
    requirements = lib.requirements.split('\n').filter(r => r.trim() !== '');
  }

  return (
    <SectionCard
      icon={<ClipboardList size={13} className="text-blue-600" />}
      title="Assigned Task"
      subtitle="Technical task assigned to the candidate"
    >
      {/* Title + badges */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{lib.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge label={lib.difficulty} style={difficultyStyle} />
            <Badge label={task.status}    style={taskStatusStyle} />
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Tag size={10} /> {lib.category}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Deadline</p>
          <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatDate(task.deadline)}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
          <BookOpen size={10} /> Description
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{lib.description}</p>
      </div>

      {/* Requirements */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={10} /> Requirements ({requirements.length})
        </p>
        <div className="space-y-2">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-blue-600">{i + 1}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{req}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-5 pt-4 border-t border-gray-100 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <Timer size={11} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{lib.duration}</span>&nbsp;Day{lib.duration !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Cpu size={11} className="text-gray-400" />
          {techStackList.map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-semibold">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Submission Report — coming soon */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <BarChart2 size={11} /> Submission Report
        </p>
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-5 py-6 flex flex-col items-center gap-2 text-center">
          <div className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
            <Clock size={15} className="text-gray-300" />
          </div>
          <p className="text-xs font-semibold text-gray-500">No submission yet</p>
          <p className="text-[11px] text-gray-400 max-w-xs">
            Once the developer submits their task, the AI evaluation report will appear here automatically.
          </p>
          <span className="mt-1 text-[10px] font-semibold bg-blue-50 border border-blue-100 text-blue-500 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Coming Soon
          </span>
        </div>
      </div>
    </SectionCard>
  );
}