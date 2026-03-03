import React from "react";
import {
  MapPin,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BranchCard = ({
  branchName,
  address,
  salesToday,
  ordersToday,
  staffCount,
  growth,
  imageUrl,
  onSelect,
  isOpen = true,
  isDark = false,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleAction = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleAction}
      className={`rounded-[40px] overflow-hidden transition-all duration-700 flex flex-col h-full relative cursor-pointer group hover:-translate-y-2.5 ${isOpen ? "" : "opacity-80"
        } ${isDark
          ? `bg-[#1E2022] border-white/10 ${isOpen ? "shadow-2xl shadow-black/60 hover:shadow-black/80" : "shadow-md shadow-black/40"}`
          : `bg-white border-gray-100 ${isOpen ? "shadow-premium hover:shadow-float" : "shadow-sm border-gray-200"}`
        } ${className}`}
    >
      {/* Edge lighting effect - High Dimension */}
      < div
        className={`absolute top-0 left-0 right-0 h-[1px] opacity-80 z-30 ${isDark ? "bg-white/10" : "bg-white"}`}
      />

      {/* Image Area */}
      <div className="relative h-60 overflow-hidden">
        <div
          className={`absolute top-5 right-5 z-20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-2 transition-all duration-500 border ${isOpen
            ? isDark
              ? "bg-white/10 text-emerald-400 border-white/10 shadow-lg"
              : "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
            : isDark
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg"
              : "bg-rose-50 text-rose-600 border-rose-200 shadow-sm"
            }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-rose-500"}`}
          ></div>
          {isOpen ? "Online" : "Offline"}
        </div>
        <img
          src={imageUrl}
          alt={branchName}
          className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 ${!isOpen && "grayscale"
            }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 opacity-40 group-hover:opacity-60 ${isDark ? "from-black/80 to-transparent" : "from-gray-900/60 to-transparent"
            }`}
        ></div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="flex items-start justify-between gap-4 mb-2 relative z-10">
          <h3
            className={`text-2xl font-black transition-all duration-500 tracking-tighter line-clamp-2 break-words flex-1 ${isDark
              ? "text-white group-hover:text-primary"
              : "text-gray-900 group-hover:text-primary"
              }`}
            title={branchName}
          >
            {branchName}
          </h3>
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-transform group-hover:scale-105 duration-500 shrink-0 ${growth > 0
              ? isDark
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
              : growth < 0
                ? isDark
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                  : "bg-rose-50 text-rose-600 border border-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.05)]"
                : isDark
                  ? "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
          >
            <BarChart3 size={12} strokeWidth={3} />
            <span>เติบโต {growth > 0 ? `+${growth}` : growth}%</span>
          </div>
        </div>
        <div
          className={`flex items-start text-[10px] font-black uppercase tracking-widest mb-8 relative z-10 ${isDark ? "text-inactive opacity-60" : "text-inactive"
            }`}
        >
          <MapPin
            size={12}
            className={`mr-2 shrink-0 mt-0.5 ${isDark ? "text-primary/60" : "text-primary"}`}
          />
          <span className="line-clamp-2 break-words" title={address}>
            {address}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 mb-10 relative z-10">
          {/* Sales Row - Higher Dimension */}
          <div
            className={`flex items-center p-5 rounded-[24px] transition-all duration-500 border ${isDark
              ? "bg-white/5 hover:bg-white/10 border-white/10 shadow-inner"
              : "bg-gray-50/50 hover:bg-white border-gray-100 hover:shadow-premium-lg"
              }`}
          >
            <div
              className={`w-11 h-11 shrink-0 rounded-[18px] flex items-center justify-center border shadow-sm group-hover:rotate-12 transition-all duration-500 mr-4 ${isDark
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-white text-primary border-gray-100 shadow-inner-light"
                }`}
            >
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-inactive uppercase tracking-[0.1em]">
                ยอดขายวันนี้
              </span>
              <span
                className={`text-2xl font-black tracking-tighter leading-none ${isDark ? "text-white" : "text-gray-900"}`}
              >
                ฿{salesToday.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Orders */}
            <div
              className={`flex items-center justify-between p-5 rounded-[24px] transition-all duration-500 border ${isDark
                ? "bg-white/5 hover:bg-white/10 border-white/10 shadow-inner"
                : "bg-gray-50/50 hover:bg-white border-gray-100 hover:shadow-premium-lg"
                }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart
                  size={16}
                  className="text-blue-500 opacity-80"
                  strokeWidth={2.5}
                />
                <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                  คำสั่งซื้อ
                </span>
              </div>
              <span
                className={`text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {ordersToday} รายการ
              </span>
            </div>
          </div>
        </div>

        {/* Action Button - High Dimension */}
        <div className="mt-auto relative z-10">
          <div
            className={`w-full py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 relative overflow-hidden transition-all duration-500 shadow-xl hover:-translate-y-1.5 active:scale-95 group/btn cursor-pointer ${isOpen
                ? isDark
                  ? "bg-primary text-white shadow-primary/20 hover:shadow-primary/40 border border-white/10"
                  : "bg-primary text-white shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30"
                : isDark
                  ? "bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500"
                  : "bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-200"
              }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${isOpen
                  ? isDark ? "from-white/10" : "from-primary/20"
                  : isDark ? "from-white/5" : "from-gray-300/30"
                } to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500`}
            />
            <span className="relative z-10">{isOpen ? "เข้าสู่ระบบจัดการ" : "เข้าสู่ระบบจัดการ (ออฟไลน์)"}</span>
            <ArrowRight
              size={18}
              strokeWidth={3}
              className="group-hover/btn:translate-x-2 transition-transform duration-500 relative z-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchCard;
