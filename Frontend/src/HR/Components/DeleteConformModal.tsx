import { Trash2, AlertTriangle } from "lucide-react";

interface Props {
  taskTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ taskTitle, isDeleting, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onCancel} />

      <div className="relative bg-white w-full max-w-sm rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 overflow-hidden">

        {/* Accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-red-400 to-red-500" />

        <div className="px-6 py-6">

          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">Delete Task</h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-gray-700">"{taskTitle}"</strong>?
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Trash2 size={12} /> Delete Task</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;