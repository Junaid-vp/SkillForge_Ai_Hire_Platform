import React, { useState } from 'react';
import { UserPlus, X, Hash } from 'lucide-react';

interface TaskAssignModalProps {
  taskTitle: string;
  isAssgin: boolean;
  onConfirm: (code: string) => Promise<void> | void;
  onCancel: () => void;
}

const TaskAssignModal: React.FC<TaskAssignModalProps> = ({
  taskTitle,
  isAssgin,
  onConfirm,
  onCancel,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Developer ID code is required");
      return;
    }
    setError(null);
    try {
      await onConfirm(code.trim());
    } catch (err: any) {
      setError(err.response?.data?.Message || "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 font-sans antialiased">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            {!isAssgin && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">Assign Task</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            You are assigning <span className="font-semibold text-gray-700">"{taskTitle}"</span>. Please enter the unique code of the developer you want to assign this task to.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Developer Unique Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  placeholder="e.g. DEV-A1B2C3"
                  className="w-full bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                  disabled={isAssgin}
                  required
                />
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <div className="flex justify-end items-center gap-2 mt-8">
              <button
                type="button"
                onClick={onCancel}
                disabled={isAssgin}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssgin}
                className="flex justify-center items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssgin ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignModal;