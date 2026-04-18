import React from "react";
import { AlertCircle, X, Ban } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const CancelInterviewModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="h-1 bg-red-500 w-full" />
        <div className="p-5">
          <div className="flex flex-col items-center text-center">
            {/* Warning Icon shadow */}
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle size={18} className="text-red-500" />
                </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">Cancel Interview?</h3>
            <p className="text-xs text-gray-400 leading-relaxed px-1">
              Are you sure you want to cancel this interview? This action cannot be undone and the developer will be notified.
            </p>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-gray-500 border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-50"
            >
              No, keep it
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Ban size={13} />
                  Cancel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default CancelInterviewModal;
