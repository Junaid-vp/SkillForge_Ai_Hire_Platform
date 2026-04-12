// src/Pages/InterviewRoom/panels/NotesPanel.tsx
import { useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { api } from "../../../Api/Axios"
import toast from "react-hot-toast"

interface Props {
  notes:       string
  setNotes:    (v: string) => void
  interviewId: string
}

export default function NotesPanel({ notes, setNotes, interviewId }: Props) {
  const [isSaving,  setIsSaving]  = useState(false)
  const [savedNote, setSavedNote] = useState(false)

  const saveNotes = async () => {
    setIsSaving(true)
    try {
      await api.post("/questions/note/save", {
        interviewId,
        content: notes
      })
      // Show "Saved!" for 2 seconds then reset
      setSavedNote(true)
      setTimeout(() => setSavedNote(false), 2000)
    } catch {
      toast.error("Failed to save notes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4">

      {/* Header with save button */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <p className="text-xs font-bold text-gray-800">Interview Notes</p>
        <button
          onClick={saveNotes}
          disabled={isSaving}
          className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {isSaving
            ? <><Loader2 size={10} className="animate-spin" /> Saving...</>
            : savedNote
            ? <><CheckCircle2 size={10} className="text-green-500" /> Saved!</>
            : "Save Notes"
          }
        </button>
      </div>

      {/* Notes textarea */}
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={`Write notes about developer performance...\n\nExamples:\n• Strong React knowledge\n• Struggled with async/await\n• Good communication\n• Needs work on system design`}
        className="flex-1 bg-gray-50 text-gray-800 text-xs placeholder-gray-400
        rounded-xl p-3 outline-none border border-gray-100
        focus:border-blue-300 focus:ring-1 focus:ring-blue-100
        resize-none leading-relaxed"
      />

      <p className="text-[10px] text-gray-400 mt-2 shrink-0">
        Only you can see these notes.
      </p>
    </div>
  )
}