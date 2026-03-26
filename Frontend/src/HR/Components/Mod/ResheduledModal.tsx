import { useState } from "react";
import { api } from "../../../Api/Axios";
import { CalendarDays, Clock, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  interviewId: string;
  refetch: () => void;
}

function RescheduleModal({ open, onClose, interviewId, refetch }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isValidDateTime = () => {
    if (!date || !time) return false;
    return new Date(`${date}T${time}`) > new Date();
  };

  const getMinTime = () => {
    const today = new Date().toISOString().split("T")[0];
    if (date === today) return new Date().toTimeString().slice(0, 5);
    return "00:00";
  };

  const handleConfirm = async () => {
    setError(null);

    if (!date || !time) {
      setError("Please select both a date and time.");
      return;
    }
    if (!isValidDateTime()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/interview/reschedule`, { interviewId, newDate: date, newTime: time });
      refetch();
      onClose();
    } catch (err: any) {
      console.error("Reschedule error:", err.response?.data || err);
      setError(err.response?.data?.Message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 px-3.5 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 w-full max-w-sm overflow-hidden">

        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Reschedule Interview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pick a new date and time for this session</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-3">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <p className="text-xs text-red-500 font-medium">{error}</p>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={11} className="text-blue-500" />
                New Date <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setDate(e.target.value); setError(null); }}
              className={inputClasses}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Clock size={11} className="text-blue-500" />
                New Time <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="time"
              value={time}
              min={getMinTime()}
              onChange={(e) => { setTime(e.target.value); setError(null); }}
              className={inputClasses}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !date || !time}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Confirm Reschedule"
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;