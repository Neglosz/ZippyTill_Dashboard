import React from "react";
import { X, Save } from "lucide-react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  onSave,
  saving = false,
  saveText = "บันทึก",
  saveDisabled = false,
  hideFooter = false,
  maxWidth = "max-w-md",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-[32px] p-8 shadow-2xl border border-gray-100 w-full ${maxWidth} z-10 max-h-[90vh] overflow-y-auto custom-scrollbar`}
      >
        {/* Close button */}
        <button
          onClick={() => !saving && onClose()}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Title */}
        <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-8 flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Icon size={20} strokeWidth={2.5} />
            </div>
          )}
          {title}
        </h3>

        {/* Body */}
        {children}

        {/* Footer Actions */}
        {!hideFooter && (
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => !saving && onClose()}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm transition-all border border-gray-100 active:scale-95 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              disabled={saving || saveDisabled}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50"
            >
              <Save size={16} strokeWidth={2.5} />
              {saving ? "กำลังบันทึก..." : saveText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="group/item flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all duration-300">
    <div className="p-2.5 bg-white rounded-xl text-inactive group-hover/item:text-primary transition-colors shadow-sm border border-gray-100 shrink-0">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);
