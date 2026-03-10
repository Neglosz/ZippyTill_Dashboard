import React from "react";
import { CreditCard, Calendar, AlertCircle, TrendingUp } from "lucide-react";

const SummaryStats = ({
  totalCount,
  totalAmount,
  recentCount,
  recoveryRate,
  overdueRate,
}) => {
  const paymentRate =
    recoveryRate !== null && recoveryRate !== undefined ? recoveryRate : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Amount (Orange/Primary) */}
        <div className="bg-white rounded-[32px] p-7 shadow-premium border border-gray-100 hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary border border-orange-100 shadow-sm group-hover:rotate-6 transition-transform">
              <CreditCard size={22} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100/50 shadow-inner-light">
              ยอดคงค้างทั้งหมด
            </div>
          </div>
          <div className="relative z-10 text-right">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2.5">
              ยอดค้างชำระทั้งหมด
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none flex items-baseline justify-end">
              <span className="text-lg mr-1.5 opacity-50 font-bold">฿</span>
              {Math.floor(totalAmount).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Card 2: Pending Items (Orange/Secondary) */}
        <div className="bg-white rounded-[32px] p-7 shadow-premium border border-gray-100 hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary border border-orange-100 shadow-sm group-hover:rotate-6 transition-transform">
              <Calendar size={22} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100/50 shadow-inner-light">
              ใบแจ้งหนี้ที่ยังค้าง
            </div>
          </div>
          <div className="relative z-10 text-right">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2.5">
              รายการค้าง
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {totalCount}{" "}
              <span className="text-lg font-black text-inactive">รายการ</span>
            </h3>
          </div>
        </div>

        {/* Card 3: Overdue (Red/Urgent) */}
        <div className="bg-white rounded-[32px] p-7 shadow-premium border border-gray-100 hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm group-hover:rotate-6 transition-transform">
              <AlertCircle size={22} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/50 shadow-inner-light">
              ต้องติดตามด่วน
            </div>
          </div>
          <div className="relative z-10 text-right">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2.5">
              เกินกำหนด
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {recentCount}{" "}
              <span className="text-lg font-black text-inactive">บุคคล</span>
            </h3>
          </div>
        </div>

        {/* Card 4: Paid Amount (Green/Success) */}
        <div className="bg-white rounded-[32px] p-7 shadow-premium border border-gray-100 hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm group-hover:rotate-6 transition-transform">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50 shadow-inner-light">
              ยอดที่ชำระแล้ว
            </div>
          </div>
          <div className="relative z-10 text-right">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2.5">
              ว่าชำระไปเท่าไรแล้ว
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none flex items-baseline justify-end">
              <span className="text-lg mr-1.5 opacity-50 font-bold">฿</span>
              {Math.floor(recoveryRate || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
