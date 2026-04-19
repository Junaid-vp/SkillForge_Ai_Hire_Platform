// src/Dev/Components/Codeeditor.tsx

import { useState, useRef, useEffect, useCallback,  } from "react"
import Editor from "@monaco-editor/react"
import {
  Play, Loader2, CheckCircle2, XCircle,
  Code2, ChevronDown, Terminal, Clock,
  Cpu, Timer, Send, AlertCircle, Info,
} from "lucide-react"
import { LANGUAGES, DEFAULT_CODE, getLanguagesByCategory } from "../Config/languages"
import toast from "react-hot-toast"
import { submitCode, type CodeResult } from "../../Service/judge0"
import { getSocket } from "../../Service/socket"
import { api } from "../../Api/Axios"

interface LeetCodeQuestion {
  id:            string
  questionText:  string
  estimatedTime: number | null
  inputExample:  string | null
  outputExample: string | null
  constraints:   string | null
}

interface QuestionState {
  code:      string
  language:  typeof LANGUAGES[0]
  output:    CodeResult | null
  runCount:  number
  submitted: boolean
}

interface Props {
  interviewId:    string
  questions:      LeetCodeQuestion[]
  onAllSubmitted: () => void

}

export default function EmbeddedCodeEditor({
  interviewId,
  questions,
  onAllSubmitted,

}: Props) {
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>(() => {
    const init: Record<number, QuestionState> = {}
    questions.forEach((_, i) => {
      init[i] = {
        code:      DEFAULT_CODE[LANGUAGES[0].monacoLang] ?? "",
        language:  LANGUAGES[0],
        output:    null,
        runCount:  0,
        submitted: false,
      }
    })
    return init
  })

  const [activeQ,      setActiveQ]      = useState(0)
  const [stdin,        setStdin]        = useState("")
  const [showStdin,    setShowStdin]    = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [isRunning,    setIsRunning]    = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [timers, setTimers] = useState<Record<number, number>>(() => {
    const t: Record<number, number> = {}
    questions.forEach((q, i) => { t[i] = (q.estimatedTime ?? 20) * 60 })
    return t
  })
  const [timerActive, setTimerActive] = useState<Record<number, boolean>>({})
  const timerRef    = useRef<number | null>(null)
  const langMenuRef = useRef<HTMLDivElement>(null)

  const current  = questionStates[activeQ]
  const currentQ = questions[activeQ]
  const categoryGroups = getLanguagesByCategory()

  const updateCurrent = useCallback((patch: Partial<QuestionState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [activeQ]: { ...prev[activeQ], ...patch }
    }))
  }, [activeQ])

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Countdown timer per question
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!timerActive[activeQ]) return

    timerRef.current = setInterval(() => {
      setTimers(prev => {
        const next = (prev[activeQ] ?? 0) - 1
        if (next <= 0) {
          clearInterval(timerRef.current!)
          setTimerActive(p => ({ ...p, [activeQ]: false }))
          toast("Time's up for this problem!", {
            icon: <Timer size={16} className="text-red-500" />,
            style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
          })
          return { ...prev, [activeQ]: 0 }
        }
        return { ...prev, [activeQ]: next }
      })
    }, 1000) as unknown as number

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeQ, timerActive])

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`

  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    updateCurrent({
      language: lang,
      code:     DEFAULT_CODE[lang.monacoLang] ?? "// Write your solution here\n",
      output:   null,
    })
    setShowLangMenu(false)
  }

  const handleQuestionChange = (index: number) => {
    setActiveQ(index)
    setStdin("")
    setShowStdin(false)
  }

  const runCode = async () => {
    if (!current.code.trim() || isRunning) return

    if (!timerActive[activeQ]) {
      setTimerActive(prev => ({ ...prev, [activeQ]: true }))
    }

    setIsRunning(true)
    updateCurrent({ output: null })

    try {
      const result = await submitCode({
        sourceCode: current.code,
        languageId: current.language.id,
        stdin,
      })

      updateCurrent({ output: result, runCount: current.runCount + 1 })

      getSocket().emit("code-result", {
        interviewId,
        questionId: currentQ?.id,
        output:     result.output,
        status:     result.status,
        language:   current.language.name,
        time:       result.time,
        memory:     result.memory,
        code:       current.code,
      })
    } catch {
      updateCurrent({
        output: {
          status: "Error",
          output: "Failed to execute. Check your code and try again.",
          error:  "",
          time:   "0",
          memory: "0",
        }
      })
    } finally {
      setIsRunning(false)
    }
  }

  const submitSolution = async () => {
    if (!current.code.trim())  { toast.error("Write your solution first"); return }
    if (!current.output)       { toast.error("Run your code at least once before submitting"); return }
    if (current.submitted)     { toast("Already submitted"); return }

    setIsSubmitting(true)
    const loadingToast = toast.loading("Submitting solution...")

    try {
      await api.post("/code/submit", {
        questionId:  currentQ?.id,
        interviewId,
        code:        current.code,
        language:    current.language.name,
        output:      current.output.output,
        codeStatus:  current.output.status,
        runCount:    current.runCount,
      })

      updateCurrent({ submitted: true })
      toast.dismiss(loadingToast)
      toast.success("Solution submitted!")

      const updatedStates = {
        ...questionStates,
        [activeQ]: { ...current, submitted: true }
      }
      const allDone = questions.every((_, i) => updatedStates[i]?.submitted)

      if (allDone) {
        setTimeout(() => onAllSubmitted(), 1000)
      } else if (activeQ < questions.length - 1) {
        setTimeout(() => handleQuestionChange(activeQ + 1), 800)
      }
    } catch {
      toast.dismiss(loadingToast)
      toast.error("Failed to submit solution")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusStyle = (status: string) => {
    if (status === "Accepted") return {
      bg: "bg-green-500/10 border-green-500/20", text: "text-green-400",
      icon: <CheckCircle2 size={13} className="text-green-400" />
    }
    if (status.includes("Error") || status.includes("Wrong")) return {
      bg: "bg-red-500/10 border-red-500/20", text: "text-red-400",
      icon: <XCircle size={13} className="text-red-400" />
    }
    return {
      bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400",
      icon: <Clock size={13} className="text-yellow-400" />
    }
  }

  const getExt = (monacoLang: string) => ({
    cpp: "cpp", java: "java", python: "py", typescript: "ts",
    go: "go", rust: "rs", javascript: "js", csharp: "cs",
    kotlin: "kt", swift: "swift", ruby: "rb", php: "php",
  } as Record<string, string>)[monacoLang] ?? "txt"

  return (
    <div className="flex-1 bg-[#1e1e2e] flex flex-col overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="bg-[#181825] border-b border-white/5 px-5 h-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <Code2 size={12} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">Code Editor</span>
          <span className="text-white/20 text-xs font-mono">#{interviewId.slice(0, 8)}</span>

          {/* Problem tabs */}
          <div className="flex items-center gap-1 ml-4">
            {questions.map((_, i) => {
              const state = questionStates[i]
              return (
                <button
                  key={i}
                  onClick={() => handleQuestionChange(i)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeQ === i ? "bg-blue-600 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  Problem {i + 1}
                  {state?.submitted && <CheckCircle2 size={9} className="text-green-400" />}
                  {state?.output && !state.submitted && (
                    <span className={`w-1.5 h-1.5 rounded-full ${state.output.status === "Accepted" ? "bg-green-400" : "bg-red-400"}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {currentQ?.estimatedTime && (
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${
              timers[activeQ] <= 60  ? "bg-red-500/10 border-red-500/20 text-red-400"
              : timers[activeQ] <= 300 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              : "bg-white/5 border-white/10 text-white/60"
            }`}>
              <Timer size={11} />
              {formatTime(timers[activeQ] ?? 0)}
            </div>
          )}

          {/* Language selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>{current?.language?.name ?? LANGUAGES[0].name}</span>
              <ChevronDown size={11} className="text-white/40" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#181825] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                {Object.entries(categoryGroups).map(([category, langs]) => (
                  <div key={category}>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30 bg-white/5 sticky top-0">
                      {category}
                    </div>
                    {langs.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 ${
                          current?.language?.id === lang.id ? "text-blue-400 bg-blue-500/10" : "text-white/70"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={runCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
          >
            {isRunning ? <><Loader2 size={12} className="animate-spin" /> Running...</> : <><Play size={12} /> Run</>}
          </button>

          <button
            onClick={submitSolution}
            disabled={isRunning || isSubmitting || current?.submitted}
            className={`flex items-center gap-2 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
              current?.submitted ? "bg-green-700 cursor-default" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isSubmitting
              ? <><Loader2 size={12} className="animate-spin" /> Submitting...</>
              : current?.submitted
              ? <><CheckCircle2 size={12} /> Submitted</>
              : <><Send size={12} /> Submit</>
            }
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel: Problem + Output ── */}
        <div className="w-[380px] shrink-0 flex flex-col bg-[#181825] border-r border-white/5">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Code2 size={32} className="text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No problems assigned</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 uppercase tracking-wider">LeetCode</span>
                  {currentQ?.estimatedTime && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-semibold">
                      ~{currentQ.estimatedTime} min
                    </span>
                  )}
                  <span className="text-[10px] text-white/30">Problem {activeQ + 1} of {questions.length}</span>
                  {current?.runCount > 0 && <span className="text-[10px] text-white/30">{current.runCount} run{current.runCount !== 1 ? "s" : ""}</span>}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-white/80 leading-relaxed">{currentQ?.questionText}</p>
                </div>

                {(currentQ?.inputExample || currentQ?.outputExample) && (
                  <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info size={10} className="text-white/30" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Example</p>
                    </div>
                    {currentQ.inputExample && (
                      <div className="mb-2">
                        <p className="text-[10px] text-white/40 mb-1">Input:</p>
                        <code className="text-xs text-green-400 font-mono bg-black/20 px-2 py-1.5 rounded-lg block whitespace-pre-wrap">{currentQ.inputExample}</code>
                      </div>
                    )}
                    {currentQ.outputExample && (
                      <div>
                        <p className="text-[10px] text-white/40 mb-1">Output:</p>
                        <code className="text-xs text-blue-400 font-mono bg-black/20 px-2 py-1.5 rounded-lg block whitespace-pre-wrap">{currentQ.outputExample}</code>
                      </div>
                    )}
                  </div>
                )}

                {currentQ?.constraints && (
                  <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle size={10} className="text-white/30" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Constraints</p>
                    </div>
                    <p className="text-xs text-white/60 font-mono leading-relaxed whitespace-pre-wrap">{currentQ.constraints}</p>
                  </div>
                )}

                <div>
                  <button
                    onClick={() => setShowStdin(!showStdin)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors mb-2"
                  >
                    <Terminal size={11} />
                    {showStdin ? "Hide Custom Input" : "Custom Input (stdin)"}
                  </button>
                  {showStdin && (
                    <textarea
                      value={stdin}
                      onChange={e => setStdin(e.target.value)}
                      placeholder="Enter test input..."
                      rows={4}
                      className="w-full bg-white/5 text-white/80 text-xs font-mono placeholder-white/20 rounded-xl p-3 outline-none border border-white/10 focus:border-blue-500/50 resize-none"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Output Panel */}
          <div className="border-t border-white/5 shrink-0">
            <div className="px-4 py-2 flex items-center justify-between bg-white/3">
              <div className="flex items-center gap-2">
                <Terminal size={11} className="text-white/30" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Output</span>
              </div>
              {current?.runCount > 0 && <span className="text-[10px] text-white/20">Run #{current.runCount}</span>}
            </div>

            <div className="p-4 min-h-[160px] max-h-[220px] overflow-y-auto">
              {isRunning && (
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Loader2 size={12} className="animate-spin text-blue-400" /> Executing code...
                </div>
              )}
              {!isRunning && !current?.output && (
                <p className="text-xs text-white/20 italic">Run your code to see output here</p>
              )}
              {current?.output && !isRunning && (
                <>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-3 ${getStatusStyle(current.output.status).bg}`}>
                    <div className="flex items-center gap-2">
                      {getStatusStyle(current.output.status).icon}
                      <span className={`text-xs font-bold ${getStatusStyle(current.output.status).text}`}>{current.output.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span className="flex items-center gap-1"><Clock size={9} /> {current.output.time}s</span>
                      <span className="flex items-center gap-1"><Cpu size={9} /> {current.output.memory}KB</span>
                    </div>
                  </div>
                  <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed bg-white/5 rounded-lg p-3 overflow-x-auto">
                    {current.output.output || "No output"}
                  </pre>
                  {current.output.error && current.output.error !== current.output.output && (
                    <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap leading-relaxed bg-red-500/5 rounded-lg p-3 overflow-x-auto mt-2">
                      {current.output.error}
                    </pre>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Monaco Editor + Camera PiP ── */}
        <div className="flex-1 overflow-hidden flex flex-col relative">

        

          {/* Editor file tab */}
          <div className="bg-[#1e1e2e] border-b border-white/5 px-4 py-2 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-white/30 font-mono">
              solution.{getExt(current?.language?.monacoLang ?? "javascript")}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={current?.language?.monacoLang ?? "javascript"}
              value={current?.code ?? ""}
              onChange={value => updateCurrent({ code: value ?? "" })}
              theme="vs-dark"
              options={{
                fontSize:               14,
                fontFamily:             "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures:          true,
                minimap:                { enabled: false },
                scrollBeyondLastLine:   false,
                automaticLayout:        true,
                tabSize:                2,
                wordWrap:               "on",
                lineNumbers:            "on",
                renderLineHighlight:    "line",
                cursorBlinking:         "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling:        true,
                padding:                { top: 20, bottom: 20 },
                bracketPairColorization: { enabled: true },
                guides:                 { bracketPairs: true, indentation: true },
                suggest:                { showKeywords: true, showSnippets: true },
                quickSuggestions:       { other: true, comments: false, strings: false },
              }}
            />
          </div>

          {/* ── Bottom bar: Run + Submit — no video overlapping ── */}
          <div className="bg-[#181825] border-t border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="text-xs text-white/30">
              {current?.submitted
                ? <span className="flex items-center gap-1.5 text-green-400 font-medium">
                    <CheckCircle2 size={12} /> Solution submitted
                  </span>
                : current?.output
                ? `Last run: ${current.output.status}`
                : "Run your code first, then submit"
              }
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                {isRunning ? <><Loader2 size={11} className="animate-spin" /> Running...</> : <><Play size={11} /> Run Code</>}
              </button>
              <button
                onClick={submitSolution}
                disabled={isRunning || isSubmitting || current?.submitted || !current?.output}
                className={`flex items-center gap-2 text-white text-xs font-bold px-5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  current?.submitted ? "bg-green-700" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isSubmitting
                  ? <><Loader2 size={11} className="animate-spin" /> Submitting...</>
                  : current?.submitted
                  ? <><CheckCircle2 size={11} /> Submitted</>
                  : <><Send size={11} /> Submit Solution</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}