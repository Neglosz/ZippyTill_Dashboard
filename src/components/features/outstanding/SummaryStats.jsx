import React from "react";
import { FileText, Banknote, User } from "lucide-react";

const SummaryStats = ({ totalCount, totalAmount, recentCount }) => {
  return (
    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B2559]">สรุปยอดค้างชำระ</h2>
          <p className="text-gray-400 text-sm mt-1">ภาพรวมบัญชีลูกหนี้</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <FileText size={16} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Count (Pink) */}
        <div className="bg-[#FFE2E5] rounded-[20px] p-6 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
          <div className="h-10 w-10 bg-[#FA5A7D] rounded-full flex items-center justify-center text-white shadow-sm mb-4">
            <FileText size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[#151D48] text-3xl font-bold mb-1">
              {totalCount}
            </p>
            <p className="text-[#425166] text-sm font-medium">รายการทั้งหมด</p>
            <p className="text-[#FA5A7D] text-xs font-semibold mt-1">
              +8% จากเดือนก่อน
            </p>
          </div>
        </div>

        {/* Card 2: Total Amount (Cream/Yellow) */}
        <div className="bg-[#FFF4DE] rounded-[20px] p-6 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
          <div className="h-10 w-10 bg-[#FF947A] rounded-full flex items-center justify-center text-white shadow-sm mb-4">
            <Banknote size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[#151D48] text-3xl font-bold mb-1">
              ฿{Math.floor(totalAmount).toLocaleString()}
            </p>
            <p className="text-[#425166] text-sm font-medium">ยอดรวมค้างชำระ</p>
            <p className="text-[#FF947A] text-xs font-semibold mt-1">
              +5% จากเดือนก่อน
            </p>
          </div>
        </div>

        {/* Card 3: Recent (Green) */}
        <div className="bg-[#DCFCE7] rounded-[20px] p-6 flex flex-col justify-between h-40 transition-transform hover:-translate-y-1 duration-300">
          <div className="h-10 w-10 bg-[#3CD856] rounded-full flex items-center justify-center text-white shadow-sm mb-4">
            <User size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[#151D48] text-3xl font-bold mb-1">
              {recentCount}
            </p>
            <p className="text-[#425166] text-sm font-medium">
              เพิ่งเกินกำหนด (7วัน)
            </p>
            <p className="text-[#3CD856] text-xs font-semibold mt-1">
              +1.2% จากเดือนก่อน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
