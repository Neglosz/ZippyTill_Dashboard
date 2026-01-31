import React from "react";
import {
  MapPin,
  TrendingUp,
  ShoppingCart,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BranchCard = ({
  branchName,
  address,
  salesToday,
  ordersToday,
  staffCount,
  growth,
  imageUrl,
  isOpen = true,
  isDark = false,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate("/dashboard");
  };

  return (
    <div
      className={`rounded-[40px] overflow-hidden transition-all duration-700 flex flex-col h-full group relative hover:-translate-y-2.5 ${isDark
        ? "bg-[#1E2022] border-white/10 shadow-2xl shadow-black/60 hover:shadow-black/80"
        : "bg-white border-gray-100 shadow-premium hover:shadow-float"
        }`}
    >
      {/* Edge lighting effect - High Dimension */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] opacity-80 z-30 ${isDark ? "bg-white/10" : "bg-white"}`}
      />

      {/* Image Area */}
      <div className="relative h-60 overflow-hidden">
        <div
          className={`absolute top-5 right-5 z-20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-2 transition-all duration-500 border ${isOpen
            ? isDark
              ? "bg-white/10 text-emerald-400 border-white/10 shadow-lg"
              : "bg-white/80 text-emerald-600 border-emerald-100 shadow-sm"
            : "bg-black/40 text-gray-400 border-white/5"
            }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-gray-400"}`}
          ></div>
          {isOpen ? "Online" : "Offline"}
        </div>
        <img
          src={imageUrl}
          alt={branchName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t opacity-40 group-hover:opacity-60 transition-opacity duration-500 ${isDark ? "from-black/80 to-transparent" : "from-gray-900/60 to-transparent"}`}
        ></div>

        {/* Branch Initials Overlay - Enhanced Depth */}
        <div className="absolute bottom-6 left-6 z-20 scale-110">
          <div className="bg-white/20 backdrop-blur-xl border border-white/40 text-white w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-xl shadow-float transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
            {branchName.split(" ").pop().charAt(0)}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <h3
          className={`text-2xl font-black mb-1 transition-all duration-500 relative z-10 tracking-tighter ${isDark
            ? "text-white group-hover:text-primary"
            : "text-gray-900 group-hover:text-primary"
            }`}
        >
          {branchName}
        </h3>
        <div
          className={`flex items-center text-[10px] font-black uppercase tracking-widest mb-8 relative z-10 ${isDark ? "text-inactive opacity-60" : "text-inactive"
            }`}
        >
          <MapPin
            size={12}
            className={`mr-2 ${isDark ? "text-primary/60" : "text-primary"}`}
          />
          {address}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 mb-10 relative z-10">
          {/* Sales Row - Higher Dimension */}
          <div
            className={`flex items-center justify-between p-5 rounded-[24px] transition-all duration-500 border ${isDark
              ? "bg-white/5 hover:bg-white/10 border-white/10 shadow-inner"
              : "bg-gray-50/50 hover:bg-white border-gray-100 hover:shadow-premium-lg"
              }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-[18px] flex items-center justify-center border shadow-sm group-hover:rotate-12 transition-all duration-500 ${isDark
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-white text-primary border-gray-100 shadow-inner-light"
                  }`}
              >
                <TrendingUp size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-inactive uppercase tracking-[0.1em]">
                ยอดขายวันนี้
              </span>
            </div>
            <span
              className={`text-xl font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}
            >
              ฿{salesToday.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Orders */}
            <div
              className={`flex flex-col p-5 rounded-[24px] transition-all duration-500 border ${isDark
                ? "bg-white/5 hover:bg-white/10 border-white/10 shadow-inner"
                : "bg-gray-50/50 hover:bg-white border-gray-100 hover:shadow-premium-lg"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart
                  size={14}
                  className="text-blue-500 opacity-80"
                  strokeWidth={2.5}
                />
                <span className="text-[9px] font-black text-inactive uppercase tracking-widest">
                  คำสั่งซื้อ
                </span>
              </div>
              <span
                className={`text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {ordersToday} Items
              </span>
            </div>

            {/* Staff */}
            <div
              className={`flex flex-col p-5 rounded-[24px] transition-all duration-500 border ${isDark
                ? "bg-white/5 hover:bg-white/10 border-white/10 shadow-inner"
                : "bg-gray-50/50 hover:bg-white border-gray-100 hover:shadow-premium-lg"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Users
                  size={14}
                  className="text-amber-500 opacity-80"
                  strokeWidth={2.5}
                />
                <span className="text-[9px] font-black text-inactive uppercase tracking-widest">
                  พนักงาน
                </span>
              </div>
              <span
                className={`text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {staffCount} Staffs
              </span>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full w-max text-[10px] font-black uppercase tracking-widest transition-transform group-hover:scale-105 duration-500 ${isDark
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
              }`}
          >
            <BarChart3 size={14} strokeWidth={3} />
            <span>เติบโต +{growth}%</span>
          </div>
        </div>

        {/* Action Button - High Dimension */}
        <div className="mt-auto relative z-10">
          <button
            className={`w-full py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] shadow-xl hover:-translate-y-1.5 active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 group/btn relative overflow-hidden ${isDark
              ? "bg-primary text-white shadow-primary/20 hover:shadow-primary/40 border border-white/10"
              : "bg-primary text-white shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30"
              }`}
            onClick={handleAction}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${isDark ? "from-white/10" : "from-primary/20"} to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500`}
            />
            <span className="relative z-10">เข้าสู่ระบบจัดการ</span>
            <ArrowRight
              size={18}
              strokeWidth={3}
              className="group-hover/btn:translate-x-2 transition-transform duration-500 relative z-10"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchCard;
