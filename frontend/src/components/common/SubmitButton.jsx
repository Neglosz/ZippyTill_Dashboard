import React from "react";
import { Loader2 } from "lucide-react";

const SubmitButton = ({
  loading = false,
  loadingText = "กำลังดำเนินการ...",
  text = "ยืนยัน",
  icon: Icon = null,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full bg-primary text-white font-bold py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:bg-[#d66515] active:scale-[0.98] ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-3" size={20} strokeWidth={2} />
          {loadingText}
        </>
      ) : (
        <span className="flex items-center gap-3 tracking-wider uppercase text-[11px]">
          {Icon && <Icon size={18} strokeWidth={2} />}
          {text}
        </span>
      )}
    </button>
  );
};

export default SubmitButton;
