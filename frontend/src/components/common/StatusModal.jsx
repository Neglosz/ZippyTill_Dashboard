import React from "react";
import { Trash2, Check, CheckCircle } from "lucide-react";

const StatusModal = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  const isDelete = type === "delete";
  const isSuccess = type === "success";

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[150] animate-in fade-in duration-200"
      onClick={onCancel || onConfirm}
    >
      <div 
        className="bg-white rounded-[24px] p-6 w-full max-w-[300px] text-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-300 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[3000] animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] p-6 w-full max-w-[300px] text-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-300 border border-white/20">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          {isDelete && (
            <div className="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center text-[#D91B1B] shadow-sm ring-4 ring-red-50/50">
              <Trash2 size={28} strokeWidth={2.5} />
            </div>
          )}
          {isSuccess && (
            <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center text-[#00A753] shadow-sm ring-4 ring-green-50/50">
              <CheckCircle size={32} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Text */}
        <h3
          className={`text-lg font-bold mb-1.5 ${isDelete ? "text-[#D91B1B]" : "text-[#00A753]"
            }`}
        >
          {title}
        </h3>
        <p className="text-gray-500 mb-6 font-medium text-sm leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-2.5 justify-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-3 rounded-xl text-white font-semibold transition-all shadow-md active:scale-95 text-sm ${isDelete
                ? "bg-[#D91B1B] hover:bg-red-700 shadow-red-200"
                : "bg-[#00A753] hover:bg-green-700 shadow-green-200"
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
