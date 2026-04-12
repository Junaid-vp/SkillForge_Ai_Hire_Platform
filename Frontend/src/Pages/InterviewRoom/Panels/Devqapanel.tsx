// src/Pages/InterviewRoom/panels/DevQAPanel.tsx
import { Brain, Timer, CheckCircle2, Loader2 } from "lucide-react"
import { useQA } from "../Hooks/Useqa"


interface Props {
  qa: ReturnType<typeof useQA>
}

export default function DevQAPanel({ qa }: Props) {
  const {
    qaStarted,
    currentQuestion,
    devAnswer, setDevAnswer,
    isSubmitting,
    timeLeft,
    submitAnswer
  } = qa

  // ── State 1: Waiting for HR to start Q&A ───────────────────────────────
  if (!qaStarted && !currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Brain size={22} className="text-gray-400" />
        </div>
        <p className="text-sm font-bold text-gray-800 mb-1">Waiting for HR</p>
        <p className="text-xs text-gray-400">
          HR will start the Q&A session soon
        </p>
      </div>
    )
  }

  // ── State 2: Active question — developer answering ─────────────────────
  if (currentQuestion) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden p-4">

        {/* Question header — number + timer */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-blue-600">
            Question {currentQuestion.orderIndex} of {currentQuestion.total}
          </span>

          {/* Countdown timer */}
          {timeLeft > 0 && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              timeLeft <= 30   ? "bg-red-100 text-red-600"      // URGENT — less than 30s
              : timeLeft <= 60 ? "bg-yellow-100 text-yellow-600" // WARNING — less than 1 min
              : "bg-green-100 text-green-600"                    // OK — more than 1 min
            }`}>
              <Timer size={11} />
              {/* Format: M:SS */}
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          )}
        </div>

        {/* Question text box */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Answer textarea — flex-1 means it grows to fill space */}
        <textarea
          value={devAnswer}
          onChange={e => setDevAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="flex-1 bg-gray-50 text-gray-800 text-sm placeholder-gray-400
          rounded-xl p-3 outline-none border border-gray-100
          focus:border-blue-300 focus:ring-1 focus:ring-blue-100
          resize-none min-h-[120px]"
        />

        {/* Submit button */}
        <button
          onClick={submitAnswer}
          disabled={!devAnswer.trim() || isSubmitting}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
          text-white text-xs font-bold py-3 rounded-xl
          flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting
            ? <><Loader2 size={13} className="animate-spin" /> Submitting...</>
            : <><CheckCircle2 size={13} /> Submit Answer</>
          }
        </button>
      </div>
    )
  }

  // ── State 3: Answer submitted, waiting for next question ───────────────
  if (qaStarted && !currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={24} className="text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-700">Answer submitted!</p>
        <p className="text-xs text-gray-400 mt-1">
          Waiting for next question from HR...
        </p>
      </div>
    )
  }

  return null
}