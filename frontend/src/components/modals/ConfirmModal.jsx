import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  isDestructive = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors z-10 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="pt-10 pb-6 px-8 text-center bg-gradient-to-b from-gray-50/50 to-transparent">
          <div
            className={`inline-flex p-4 rounded-full text-white shadow-lg mb-6 ${isDestructive ? "bg-rose-500 shadow-rose-200" : "bg-primary shadow-primary/20"}`}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-sm font-bold text-inactive leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg text-sm ${
              isDestructive
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                : "bg-primary hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
