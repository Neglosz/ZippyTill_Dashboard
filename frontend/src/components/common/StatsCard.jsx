import React from "react";

export const StatsCard = ({
  title,
  amount,
  icon: Icon,
  color,
  iconBg,
  activeText = "Active",
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-premium hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden group min-h-[140px] flex items-center">
      {/* Edge lighting */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>

      {/* Background Glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${color}`}
      />

      {/* Decorative Background Icon */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none transform rotate-12 group-hover:rotate-0">
        <Icon
          size={120}
          strokeWidth={1}
          className={iconBg.replace("bg-", "text-")}
        />
      </div>

      <div className="flex w-full justify-between items-center relative z-10 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
              {title}
            </p>
            {activeText && (
              <div
                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-inner-light ${color} ${iconBg.replace("bg-", "text-")}/60 border-current/10`}
              >
                {activeText}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {amount}
            </h3>
          </div>
        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-premium group-hover:rotate-6 transition-all duration-500 ${color} ${iconBg.replace("bg-", "border-")}/20`}
        >
          <Icon
            size={28}
            strokeWidth={2.5}
            className={iconBg.replace("bg-", "text-")}
          />
        </div>
      </div>
    </div>
  );
};
