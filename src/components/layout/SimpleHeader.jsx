import React from "react";
import { LogOut, Store } from "lucide-react";

/**
 * SimpleHeader Component
 * Displays the App Logo/Title and a Logout button.
 */
const SimpleHeader = ({ isDark = false }) => {
  return (
    <header
      className={`h-16 shrink-0 px-8 flex items-center justify-between shadow-sm sticky top-0 z-50 transition-colors ${
        isDark
          ? "bg-transparent text-white border-b border-white/10"
          : "bg-white text-[#1B2559]"
      }`}
    >
      {/* Brand / Logo Area */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
            isDark
              ? "bg-white text-[#1E2022]"
              : "bg-[#7B5CFA] text-white shadow-[#7B5CFA]/20"
          }`}
        >
          <Store size={24} strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <h1
            className={`text-xl font-bold leading-none tracking-tight ${
              isDark ? "text-white" : "text-[#1B2559]"
            }`}
          >
            EASY FLOW
          </h1>
          <span
            className={`text-xs font-medium mt-0.5 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            ระบบจัดการคลังสินค้า
          </span>
        </div>
      </div>

      {/* Actions Area */}
      <button
        className={`flex items-center gap-2 transition-colors font-medium text-sm ${
          isDark
            ? "text-gray-300 hover:text-white"
            : "text-gray-500 hover:text-[#7B5CFA]"
        }`}
      >
        <LogOut size={18} />
        <span>ออกจากระบบ</span>
      </button>
    </header>
  );
};

export default SimpleHeader;
