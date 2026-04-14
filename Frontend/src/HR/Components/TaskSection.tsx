import {
  ClipboardList, BookOpen, CheckCircle2, Timer,
  Cpu, Tag, BarChart2, Clock, Brain, TrendingUp,
  AlertCircle, ShieldCheck, TestTube, FolderOpen,
  Users, Zap,
} from "lucide-react";
import { SectionCard, Badge, EmptyCard } from "./SectionCard";
import { type Task, STATUS_STYLES, DIFFICULTY_STYLES, formatDate } from "../Types/developer.types";

// ── helpers ──────────────────────────────────────────────────────────────────

const scoreColor = (score: number, max = 10) => {
  const pct = (score / max) * 100;
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-yellow-600";
  return "text-red-600";
};

const barColor = (score: number, max = 10) => {
  const pct = (score / max) * 100;
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-400";
  return "bg-red-500";
};

const recoBadge = (rec: string) => {
  if (rec === "Hire")  return "bg-green-100 text-green-700 border border-green-200";
  if (rec === "Maybe") return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  return "bg-red-100 text-red-700 border border-red-200";
};

// ── ScoreBar ──────────────────────────────────────────────────────────────────
function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-gray-500">{label}</span>
        <span className={`text-[10px] font-bold ${scoreColor(score, max)}`}>{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor(score, max)}`}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── AIReport ──────────────────────────────────────────────────────────────────
function AIReport({ raw }: { raw: any }) {
  const report = typeof raw === "string" ? JSON.parse(raw) : raw;

  const humanPct = report.aiCodeAnalysis?.humanCodePercent ?? null;
  const aiPct    = report.aiCodeAnalysis?.aiCodePercent    ?? null;

  return (
    <div className="space-y-5">

      {/* ── Overall score + recommendation ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-1.5">
          <span className={`text-3xl font-black ${scoreColor(report.overallScore)}`}>
            {report.overallScore}
          </span>
          <span className="text-sm text-gray-400 mb-0.5">/10</span>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${recoBadge(report.recommendation)}`}>
          {report.recommendation}
        </span>
      </div>

      {/* ── Summary ── */}
      <p className="text-xs text-gray-600 leading-relaxed">{report.summary}</p>

      {/* ── Score breakdown ── */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Score Breakdown</p>
        <ScoreBar label="Code Quality"  score={report.codeQuality  ?? 0} />
        <ScoreBar label="Completeness"  score={report.completeness ?? 0} />
        <ScoreBar label="Correctness"   score={report.correctness  ?? 0} />
      </div>

      {/* ── AI Code Detection ── */}
      {humanPct !== null && aiPct !== null && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Zap size={10} /> Code Originality
            </p>
            {report.aiCodeAnalysis?.confidence && (
              <span className="text-[9px] text-gray-400 font-medium">
                {report.aiCodeAnalysis.confidence} confidence
              </span>
            )}
          </div>

          {/* Split bar */}
          <div>
            <div className="flex h-2.5 rounded-full overflow-hidden mb-1.5">
              <div className="bg-blue-500 h-full" style={{ width: `${humanPct}%` }} />
              <div className="bg-orange-400 h-full" style={{ width: `${aiPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Human {humanPct}%
              </span>
              <span className="flex items-center gap-1 text-orange-500">
                AI Generated {aiPct}%
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              </span>
            </div>
          </div>

          {/* Verdict */}
          {report.aiCodeAnalysis?.verdict && (
            <p className="text-[11px] text-gray-600 italic">{report.aiCodeAnalysis.verdict}</p>
          )}

          {/* Human vs AI signals */}
          {((report.aiCodeAnalysis?.humanSignals?.length > 0) ||
            (report.aiCodeAnalysis?.aiSignals?.length > 0)) && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-200">
              {report.aiCodeAnalysis.humanSignals?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                    Human signals
                  </p>
                  {report.aiCodeAnalysis.humanSignals.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 mb-1">
                      <span className="text-blue-400 mt-0.5 shrink-0 text-[10px]">•</span>
                      <p className="text-[10px] text-gray-600 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}
              {report.aiCodeAnalysis.aiSignals?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">
                    AI signals
                  </p>
                  {report.aiCodeAnalysis.aiSignals.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 mb-1">
                      <span className="text-orange-400 mt-0.5 shrink-0 text-[10px]">•</span>
                      <p className="text-[10px] text-gray-600 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Technical findings ── */}
      {report.details && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Technical Findings</p>
          {[
            { key: "architecture",  label: "Architecture", icon: <FolderOpen size={10} className="text-gray-400" /> },
            { key: "testing",       label: "Testing",      icon: <TestTube    size={10} className="text-gray-400" /> },
            { key: "documentation", label: "Docs",         icon: <BookOpen    size={10} className="text-gray-400" /> },
            { key: "security",      label: "Security",     icon: <ShieldCheck size={10} className="text-gray-400" /> },
          ].map(({ key, label, icon }) =>
            report.details[key] && report.details[key] !== "N/A" ? (
              <div key={key} className="flex gap-2 items-start">
                <div className="flex items-center gap-1 shrink-0 w-20 mt-0.5">
                  {icon}
                  <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                </div>
                <span className="text-[10px] text-gray-600 leading-relaxed">{report.details[key]}</span>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* ── Strengths + Improvements ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2">
             Strengths
          </p>
          {report.strengths?.map((s: string, i: number) => (
            <div key={i} className="flex items-start gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
              <p className="text-xs text-gray-600">{s}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2">
            To Improve
          </p>
          {report.improvements?.map((s: string, i: number) => (
            <div key={i} className="flex items-start gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
              <p className="text-xs text-gray-600">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommendation reason ── */}
      {report.recommendationReason && (
        <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
          report.recommendation === "Hire"  ? "bg-green-50 text-green-800 border border-green-100"
          : report.recommendation === "Maybe" ? "bg-yellow-50 text-yellow-800 border border-yellow-100"
          : "bg-red-50 text-red-800 border border-red-100"
        }`}>
          <span className="font-bold">Decision: </span>{report.recommendationReason}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const taskStatusStyle = STATUS_STYLES[task.status]                       ?? STATUS_STYLES.PENDING;
  const difficultyStyle = DIFFICULTY_STYLES[lib.difficulty.toUpperCase()] ?? DIFFICULTY_STYLES.MEDIUM;
  const techStackList   = lib.techStack.split(",").map((t) => t.trim()).filter(Boolean);

  let requirements: string[] = [];
  try {
    const parsed = JSON.parse(lib.requirements);
    requirements = Array.isArray(parsed) ? parsed : [lib.requirements];
  } catch {
    requirements = lib.requirements.split("\n").filter((r) => r.trim() !== "");
  }

  // ── Submission state helpers ──────────────────────────────────────────────
  const isSubmitted = task.status === "SUBMITTED" || task.status === "EVALUATED";
  const isEvaluated = task.status === "EVALUATED" && !!task.aiReport;
  const isPending   = task.status === "PENDING";

  return (
    <SectionCard
      icon={<ClipboardList size={13} className="text-blue-600" />}
      title="Assigned Task"
      subtitle="Technical task assigned to the candidate"
    >
      {/* ── Title + badges ── */}
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

      {/* ── Description ── */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
          <BookOpen size={10} /> Description
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{lib.description}</p>
      </div>

      {/* ── Requirements ── */}
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

      {/* ── Meta row ── */}
      <div className="flex items-center gap-5 pt-4 border-t border-gray-100 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <Timer size={11} className="text-gray-400" />
          <span className="font-semibold text-gray-700">{lib.duration}</span>
          &nbsp;Day{lib.duration !== 1 ? "s" : ""}
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

      {/* ── Submission Report ── */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <BarChart2 size={11} /> Submission Report
        </p>

        {/* PENDING — not submitted yet */}
        {isPending && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-5 py-6 flex flex-col items-center gap-2 text-center">
            <div className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
              <Clock size={15} className="text-gray-300" />
            </div>
            <p className="text-xs font-semibold text-gray-500">No submission yet</p>
            <p className="text-[11px] text-gray-400 max-w-xs">
              Once the developer submits their task, the AI evaluation report will appear here automatically.
            </p>
          </div>
        )}

        {/* SUBMITTED — waiting for AI evaluation */}
        {isSubmitted && !isEvaluated && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-6 flex flex-col items-center gap-2 text-center">
            <div className="w-9 h-9 bg-white border border-purple-100 rounded-xl flex items-center justify-center shadow-sm">
              <Brain size={15} className="text-purple-400 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-purple-700">AI Evaluating Submission...</p>
            <p className="text-[11px] text-purple-500 max-w-xs">
              Code submitted on {task.submittedAt ? formatDate(task.submittedAt) : "—"}.
              AI evaluation is in progress and will appear here shortly.
            </p>
            {task.submissionUrl && (
              <a
                href={task.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-[10px] font-semibold text-purple-600 underline underline-offset-2"
              >
                View submitted ZIP
              </a>
            )}
          </div>
        )}

        {/* EVALUATED — show full AI report */}
        {isEvaluated && (
          <div className="space-y-4">

            {/* Submission meta */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
              <span>
                Submitted: <span className="font-semibold text-gray-600">
                  {task.submittedAt ? formatDate(task.submittedAt) : "—"}
                </span>
              </span>
              {task.submissionUrl && (
                <a
                  href={task.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 underline underline-offset-2"
                >
                  View ZIP ↗
                </a>
              )}
            </div>

            {/* AI Report */}
            <AIReport raw={task.aiReport} />
          </div>
        )}
      </div>
    </SectionCard>
  );
}