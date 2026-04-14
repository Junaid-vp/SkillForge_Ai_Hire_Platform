import { useState, useRef } from "react"
import { Upload, CheckCircle2, Loader2, X, FileArchive, AlertCircle } from "lucide-react"
import { api } from "../../Api/Axios"
import toast from "react-hot-toast"

interface Props {
  isOpen:   boolean
  onClose:  () => void
  onSuccess: () => void
  taskTitle: string
}

export default function SubmitTaskModal({ isOpen, onClose, onSuccess, taskTitle }: Props) {
  const [file,         setFile]         = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragOver,     setDragOver]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".zip")) {
      toast.error("Only ZIP files are allowed")
      return
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error("File too large. Max 500MB")
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select your ZIP file first")
      return
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading("Uploading submission...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      await api.post("/task/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      toast.dismiss(loadingToast)
      toast.success("Task submitted successfully!")
      onSuccess() 

    } catch (e: any) {
      toast.dismiss(loadingToast)
      toast.error(e?.response?.data?.Message ?? "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50
    flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Submit Task</h2>
            <p className="text-xs text-gray-400 mt-0.5">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              Before submitting:
            </p>
            <ul className="space-y-1">
              {[
                "ZIP your entire project folder",
                "Include a README.md with setup instructions",
                "Remove node_modules before zipping",
                "Make sure all required features are complete"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-600">
                  <span className="font-bold mt-0.5">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : file
                ? "border-green-300 bg-green-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <>
                <FileArchive size={28} className="text-green-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-green-700">{file.name}</p>
                <p className="text-xs text-green-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-xs text-gray-400 mt-2">Click to change file</p>
              </>
            ) : (
              <>
                <Upload size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-600">
                  Drop your ZIP file here
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                <p className="text-[10px] text-gray-300 mt-3">
                  Only .zip files · Max 500MB
                </p>
              </>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
            <AlertCircle size={13} className="text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 leading-relaxed">
              <span className="font-semibold">This action is final.</span> Once submitted,
              you cannot login again. Your submission will be reviewed by AI and HR.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border
            border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600
            hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold
            py-2.5 rounded-xl transition-colors"
          >
            {isSubmitting
              ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
              : <><CheckCircle2 size={13} /> Submit Task</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}