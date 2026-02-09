import React from "react";

/**
 * SummaryCard Component
 * Displays a summary statistic with an icon, title, value, and optional subtext.
 *
 * @param {React.ReactNode} icon - The icon component to display
 * @param {string} title - The title of the card (e.g., "สาขาทั้งหมด")
 * @param {string|number} value - The main statistic value (e.g., "3 สาขา")
 * @param {string} iconBgColor - Background color for the icon container class (e.g. "bg-blue-100")
 * @param {string} iconColor - Text color for the icon class (e.g. "text-blue-600")
 */
const SummaryCard = ({
  icon,
  title,
  value,
  subtext,
  isDark = false,
}) => {
  return (
    <div
      className={`rounded-[32px] p-6 flex items-center gap-6 transition-all duration-700 cursor-default group relative overflow-hidden flex-1 ${
        isDark
          ? "bg-gradient-to-b from-[#24262b] to-[#1a1b1f] border-white/5 shadow-2xl shadow-black/40 hover:shadow-black/60"
          : "bg-white border-gray-100 shadow-premium hover:shadow-premium-hover"
      } hover:-translate-y-1`}
    >
      {!isDark && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
      {isDark && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10" />
      )}

      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 duration-500 relative z-10 ${
          isDark
            ? "bg-white/5 text-white border border-white/10 shadow-inner"
            : "bg-gray-50 text-primary border border-gray-100 shadow-sm"
        }`}
      >
        {isDark && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors ${
            isDark ? "text-gray-500 opacity-60" : "text-inactive"
          }`}
        >
          {title}
        </span>
        <div className="flex flex-col">
          <span
            className={`text-2xl font-black leading-tight tracking-tighter ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </span>
          {subtext && (
            <span
              className={`text-xs font-medium mt-1 ${isDark ? "text-gray-400" : "text-inactive"}`}
            >
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
