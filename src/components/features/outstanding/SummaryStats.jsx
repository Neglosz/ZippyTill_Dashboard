import React from "react";
import {
  CreditCard,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const SummaryStats = ({ totalCount, totalAmount, recentCount, overdueCount = 5 }) => {
  // Mock data for Payment Rate (since it's not in props yet)
  const paymentRate = 87;

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">ค้างชำระ</h2>
        <p className="text-gray-500 text-sm">จัดการและติดตามลูกค้าที่ค้างชำระ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Amount (Purple) */}
        <div className="bg-[#A855F7] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">ยอดค้างชำระทั้งหมด</p>
              <h3 className="text-2xl font-bold">฿{Math.floor(totalAmount).toLocaleString()}</h3>
            </div>
            <CreditCard className="text-purple-200" size={24} />
          </div>
          <p className="text-purple-100 text-sm">{totalCount} ราย</p>
        </div>

        {/* Card 2: Pending Items (Blue) */}
        <div className="bg-[#3B82F6] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">รายการค้าง</p>
              <h3 className="text-2xl font-bold">{totalCount} รายการ</h3>
            </div>
            <Calendar className="text-blue-200" size={24} />
          </div>
          <p className="text-blue-100 text-sm">ทั้งหมด</p>
        </div>

        {/* Card 3: Overdue (Red) */}
        <div className="bg-[#EF4444] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">เกินกำหนด</p>
              <h3 className="text-2xl font-bold">{recentCount} ราย</h3>
            </div>
            <AlertCircle className="text-red-200" size={24} />
          </div>
          <p className="text-red-100 text-sm">ต้องติดตาม</p>
        </div>

        {/* Card 4: Payment Rate (Green) */}
        <div className="bg-[#22C55E] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">อัตราชำระ</p>
              <h3 className="text-2xl font-bold">{paymentRate}%</h3>
            </div>
            <CreditCard className="text-green-200" size={24} />
          </div>
          <p className="text-green-100 text-sm">เดือนนี้</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
