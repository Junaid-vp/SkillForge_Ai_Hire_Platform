import { Brain } from "lucide-react";
import { SectionCard, EmptyCard } from "./SectionCard";

export function AISummarySection({ summary }: { summary: string | null }) {
  return (
    <SectionCard
      icon={<Brain size={13} className="text-blue-600" />}
      title="AI Candidate Summary"
      subtitle="Auto-generated from resume by AI"
    >
      {summary ? (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
            <Brain size={10} className="text-blue-500" />
            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">AI Generated</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{summary}</p>
        </div>
      ) : (
        <EmptyCard message="No AI summary available. Upload a resume to generate one." />
      )}
    </SectionCard>
  );
}