// src/Pages/InterviewRoom/panels/HRQAPanel.tsx

import { Brain, Code2, Loader2, ChevronRight, Star, Timer } from "lucide-react"
import { useQA } from "../Hooks/Useqa"


interface Props {
  qa:                ReturnType<typeof useQA>
  interviewId:       string
  leetcodeStartTime: Date | null
  leetcodeElapsed:   number
  codingComplete:    boolean
  codeResults:       any[]
  openCodeEditor:    () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (score: number) =>
  score >= 8 ? "text-green-500" : score >= 5 ? "text-yellow-500" : "text-red-500"

const formatElapsed = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`

export default function HRQAPanel({
  qa, interviewId,
  leetcodeStartTime, leetcodeElapsed,
  codingComplete, codeResults,
  openCodeEditor
}: Props) {

  const {
    questions, techQuestions, leetcodeQs, evaluations,
    currentQIndex, qaStarted, awaitingAnswer, isGenerating,
    generateQuestions, startQA, sendQuestion
  } = qa

  const avgScore = evaluations.length > 0
    ? evaluations.reduce((a, e) => a + e.score, 0) / evaluations.length
    : 0

  // ── No questions generated yet ───────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Brain size={22} className="text-blue-500" />
        </div>
        <p className="text-sm font-bold text-gray-900 mb-1">No questions yet</p>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Generate AI questions based on developer's skills
        </p>
        <button
          onClick={generateQuestions}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
          disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
        >
          {isGenerating
            ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
            : <><Brain size={13} /> Generate Questions</>
          }
        </button>
      </div>
    )
  }

  // ── Questions ready ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Start Q&A button */}
      {!qaStarted && (
        <div className="p-4 border-b border-gray-100 shrink-0">
          <button
            onClick={startQA}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs
            font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <Brain size={13} />
            Start Q&A — {techQuestions.length} Technical Questions
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">

        {/* Technical Questions Header */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Technical Questions ({techQuestions.length})
          </p>
        </div>

        {/* Technical Question Cards */}
        <div className="p-3 space-y-2">
          {techQuestions.map((q: any, index: number) => {
            const eval_      = evaluations.find((e: any) => e.questionId === q.id)
            const isCurrent  = index === currentQIndex && qaStarted
            const isAnswered = !!eval_
            const isNext     = qaStarted && index === currentQIndex + 1 && !isAnswered && !awaitingAnswer

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-3 transition-all ${
                  isCurrent   ? "border-blue-300 bg-blue-50"
                  : isAnswered ? "border-green-200 bg-green-50/50"
                  : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400">
                        Q{q.orderIndex}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        q.difficulty === "Hard"    ? "bg-red-100 text-red-600"
                        : q.difficulty === "Medium"  ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                      }`}>
                        {q.difficulty}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                          Active
                        </span>
                      )}
                      {isCurrent && awaitingAnswer && (
                        <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">
                          Answering...
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                      {q.questionText}
                    </p>
                  </div>

                  {/* Right: score OR send arrow */}
                  {isAnswered ? (
                    <div className="shrink-0 text-center">
                      <span className={`text-base font-black ${scoreColor(eval_!.score)}`}>
                        {eval_!.score}
                      </span>
                      <span className="text-[9px] text-gray-400 block">/10</span>
                    </div>
                  ) : isNext ? (
                    <button
                      onClick={() => sendQuestion(index)}
                      className="shrink-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center"
                    >
                      <ChevronRight size={13} className="text-white" />
                    </button>
                  ) : null}
                </div>

                {/* AI Feedback */}
                {eval_ && (
                  <div className="mt-2 pt-2 border-t border-green-100">
                    <p className="text-[10px] text-gray-600 leading-relaxed">{eval_.feedback}</p>
                    {eval_.missing && (
                      <p className="text-[10px] text-red-500 mt-1">Missing: {eval_.missing}</p>
                    )}
                    <span className={`text-[9px] font-bold mt-1 block ${
                      eval_.recommendation === "Strong"   ? "text-green-600"
                      : eval_.recommendation === "Average" ? "text-yellow-600"
                      : "text-red-600"
                    }`}>
                      {eval_.recommendation}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* LeetCode Section */}
        {leetcodeQs.length > 0 && (
          <>
            {/* LeetCode header + elapsed timer */}
            <div className="px-4 py-2 bg-orange-50 border-y border-orange-100 sticky top-0 z-10 mt-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                  LeetCode ({leetcodeQs.length})
                </p>
                {leetcodeStartTime && !codingComplete && (
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    leetcodeElapsed > 1200 ? "bg-red-100 text-red-600"
                    : leetcodeElapsed > 600  ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                  }`}>
                    <Timer size={9} />
                    {formatElapsed(leetcodeElapsed)}
                  </div>
                )}
                {codingComplete && (
                  <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* LeetCode question cards */}
            <div className="p-3 space-y-2">
              {leetcodeQs.map((q: any) => (
                <div key={q.id} className="rounded-xl border border-orange-100 bg-orange-50/30 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                      LeetCode
                    </span>
                    {q.estimatedTime && (
                      <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                        ~{q.estimatedTime} min
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    {q.questionText}
                  </p>
                </div>
              ))}
            </div>

            {/* Open Code Editor button */}
            {qaStarted && !leetcodeStartTime && !codingComplete && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={openCodeEditor}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs
                  font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <Code2 size={13} />
                  Open Code Editor for Developer
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Embedded — video call stays active
                </p>
              </div>
            )}

            {/* Code editor open status */}
            {leetcodeStartTime && !codingComplete && (
              <div className="p-4 border-t border-gray-100">
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-purple-700">💻 Developer is coding</p>
                  <p className="text-[10px] text-purple-500 mt-0.5">Video stays connected</p>
                </div>
              </div>
            )}

            {/* Live code run results */}
            {codeResults.length > 0 && (
              <div className="p-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Live Runs
                </p>
                {codeResults.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2 text-xs flex items-center justify-between ${
                      r.status === "Accepted" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-gray-700">{r.language}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className={r.status === "Accepted" ? "text-green-600" : "text-red-600"}>
                        {r.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{r.time}s</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Average Score Summary */}
        {evaluations.length > 0 && (
          <div className="mx-3 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-800">Average Score</p>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-500" />
                <span className={`text-sm font-black ${scoreColor(avgScore)}`}>
                  {avgScore.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">/10</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Based on {evaluations.length} answered question{evaluations.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}