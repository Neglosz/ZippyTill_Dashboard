import React from "react";
import {
  ArrowUpRight,
  TrendingUp,
  FileText,
  Banknote,
  User,
} from "lucide-react";

const SummaryStats = ({ totalCount, totalAmount, recentCount }) => {
  return (
    <div className="mb-5">
      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Count (Indigo) */}
        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between h-36 relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04),0_6px_10px_-7px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-300">
          {/* Decorative Background Icon */}
          <div className="absolute bottom-2 right-4 opacity-[0.05] rotate-12">
            <FileText size={120} strokeWidth={1.5} color="green" />
          </div>

          <div className="flex justify-between items-start relative z-10">
            <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase">
              รายการทั้งหมด
            </p>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl font-extrabold text-[#1B2559] mb-2 tracking-tight">
              {totalCount}
            </h3>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-lg border border-green-100">
              <TrendingUp size={12} className="text-green-600" />
              <span className="text-[10px] font-bold text-green-600">
                +8% Increased
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Amount (Amber) */}
        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between h-36 relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04),0_6px_10px_-7px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-300">
          {/* Decorative Background Icon */}
          <div className="absolute bottom-1 right-5 opacity-[0.05] -rotate-12">
            <Banknote size={120} strokeWidth={1.5} color="blue" />
          </div>

          <div className="flex justify-between items-start relative z-10">
            <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase">
              ยอดรวมค้างชำระ
            </p>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl font-extrabold text-[#1B2559] mb-2 tracking-tight">
              ฿{Math.floor(totalAmount).toLocaleString()}
            </h3>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-lg border border-blue-100">
              <TrendingUp size={12} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600">
                +5% Increased
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Recent (Rose) */}
        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between h-36 relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04),0_6px_10px_-7px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-300">
          {/* Decorative Background Icon */}
          <div className="absolute bottom-2 right-4 opacity-[0.05] rotate-[15deg]">
            <User size={120} strokeWidth={1.5} color="red" />
          </div>

          <div className="flex justify-between items-start relative z-10">
            <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase">
              เพิ่งเกินกำหนด
            </p>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl font-extrabold text-[#1B2559] mb-2 tracking-tight">
              {recentCount}
            </h3>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-lg border border-red-100">
              <TrendingUp size={12} className="text-red-600 rotate-180" />
              <span className="text-[10px] font-bold text-red-600">
                -2% Decreased
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
