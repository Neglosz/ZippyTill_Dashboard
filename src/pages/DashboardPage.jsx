import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Download,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

// Mock Data for the Dashboard
const SALES_METRICS = [
  {
    label: "ยอดขายทั้งหมด",
    value: "฿1,000",
    change: "+8%",
    color: "text-rose-500",
    bg: "bg-rose-50",
    icon: FileText,
  },
  {
    label: "ออเดอร์ทั้งหมด",
    value: "300",
    change: "+5%",
    color: "text-amber-500",
    bg: "bg-amber-50",
    icon: ShoppingCart,
  },
  {
    label: "สินค้าขายออก",
    value: "5",
    change: "+1.2%",
    color: "text-green-500",
    bg: "bg-green-50",
    icon: Package,
  },
];

const BEST_SELLERS = [
  { name: "เลย์", popularity: 80, sales: 45 },
  { name: "มาม่า", popularity: 60, sales: 29 },
  { name: "สบู่", popularity: 40, sales: 18 },
  { name: "ข้าวสาร", popularity: 50, sales: 25 },
];

const RECENT_SALES = [
  {
    id: "12345",
    time: "12-09-2025 13.23 น.",
    type: "เงินสด",
    total: "฿ 320",
    status: "ได้รับแล้ว",
    statusColor: "bg-green-500",
  },
  {
    id: "12344",
    time: "12-09-2025 13.23 น.",
    type: "PromptPay",
    total: "฿ 590",
    status: "รอ",
    statusColor: "bg-amber-500",
  },
  {
    id: "12343",
    time: "12-09-2025 13.23 น.",
    type: "ค้างชำระ",
    total: "฿ 799",
    status: "ยกเลิก",
    statusColor: "bg-rose-500",
  },
];

const EXPIRING_PRODUCTS = [
  {
    name: "เลย์",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/lays_pack_1768246959348.png",
  },
  {
    name: "เบียร์",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/beer_bottle_1768246984098.png",
  },
  {
    name: "น้ำมัน",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/oil_bottle_1768247002269.png",
  },
  {
    name: "ข้าวสาร",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/rice_bag_1768247025415.png",
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-4 pb-8">
      {/* Row 1: Sales Summary | Outstanding | Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sales Today Card */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-[235px]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-bold text-[#1B2559]">ยอดขายวันนี้</h3>
              <p className="text-gray-400 text-[10px]">สรุปการขาย</p>
            </div>
            <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-all">
              <Download size={12} /> Export
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SALES_METRICS.map((item, idx) => (
              <div
                key={idx}
                className={`${item.bg} rounded-[20px] p-3 flex flex-col items-center text-center`}
              >
                <div
                  className={`h-9 w-9 bg-white rounded-xl flex items-center justify-center ${item.color} mb-2 shadow-sm`}
                >
                  <item.icon size={18} />
                </div>
                <p className="text-base font-extrabold text-[#1B2559] mb-0.5">
                  {item.value}
                </p>
                <p className="text-[9px] text-gray-500 font-bold leading-tight">
                  {item.label}
                </p>
                <div className="mt-2 flex items-center gap-0.5">
                  <TrendingUp size={9} className={item.color} />
                  <span className={`text-[8px] font-bold ${item.color}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Outstanding Card */}
        <div className="lg:col-span-3 bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 h-[235px] flex flex-col">
          <h3 className="text-lg font-bold text-[#1B2559] mb-3">
            ยอดค้างชำระทั้งหมด
          </h3>
          <div className="flex-1 bg-[#F4F1FF] rounded-[24px] p-3 flex flex-col items-center justify-center text-center">
            <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center text-[#6d28d9] mb-2 shadow-sm">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <p className="text-lg font-extrabold text-[#1B2559] mb-0.5">8 คน</p>
            <p className="text-gray-400 text-[9px] font-bold mb-1">
              ยอดเงินทั้งหมด
            </p>
            <p className="text-2xl font-black text-[#1B2559] leading-tight">
              ฿1,930
            </p>
          </div>
        </div>

        {/* Target vs Sales Chart */}
        <div className="lg:col-span-4 bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col h-[235px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-[#1B2559]">
              เป้าหมาย vs ยอดขาย
            </h3>
            <MoreVertical size={16} className="text-gray-300 cursor-pointer" />
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-1.5 h-32 px-1">
              {[
                { m: "Jan", v1: 45, v2: 65 },
                { m: "Feb", v1: 55, v2: 75 },
                { m: "Mar", v1: 50, v2: 70 },
                { m: "Apr", v1: 70, v2: 90 },
                { m: "May", v1: 60, v2: 80 },
                { m: "June", v1: 85, v2: 100 },
                { m: "July", v1: 75, v2: 95 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center gap-0.5 items-end h-[110px]">
                    <div
                      className="w-2 bg-[#00E096] rounded-t-full"
                      style={{ height: `${item.v1}%` }}
                    ></div>
                    <div
                      className="w-2 bg-[#FFA41B] rounded-t-full"
                      style={{ height: `${item.v2}%` }}
                    ></div>
                  </div>
                  <span className="text-[8px] font-bold text-gray-300 mt-1 uppercase">
                    {item.m}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center gap-6 border-t border-gray-50 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                <span className="text-[9px] font-bold text-gray-500">
                  ยอดขายจริง
                </span>
                <span className="text-[9px] font-bold text-green-500 ml-1">
                  8,823
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-400 rounded-sm"></div>
                <span className="text-[9px] font-bold text-gray-500">
                  เป้าหมาย
                </span>
                <span className="text-[9px] font-bold text-amber-500 ml-1">
                  12,122
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <h3 className="text-lg font-bold text-[#1B2559] mb-4">สินค้าขายดี</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="pb-3 px-2">#</th>
                <th className="pb-3 px-2">ชื่อ</th>
                <th className="pb-3 px-2 w-1/2">ความนิยม</th>
                <th className="pb-3 px-2 text-center">ยอดขาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {BEST_SELLERS.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-2 text-xs font-bold text-gray-400">
                    {(idx + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="py-2.5 px-2 text-xs font-bold text-[#1B2559]">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          idx === 0
                            ? "bg-[#00B5FF]"
                            : idx === 1
                            ? "bg-[#00E096]"
                            : "bg-[#8833FF]"
                        }`}
                        style={{ width: `${item.popularity}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-500 border border-blue-100">
                      {item.sales}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-7 bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#1B2559]">รายการล่าสุด</h3>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-gray-500 cursor-pointer">
              ธันวาคม <ChevronDown size={12} />
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="pb-3 px-2">บิล</th>
                <th className="pb-3 px-2">วันที่</th>
                <th className="pb-3 px-2">ประเภท</th>
                <th className="pb-3 px-2">ยอดรวม</th>
                <th className="pb-3 px-2 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_SALES.map((sale, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-2 text-xs font-bold text-[#1B2559]">
                    {sale.id}
                  </td>
                  <td className="py-2.5 px-2 text-[10px] font-semibold text-gray-500">
                    {sale.time.split(" ")[0]}
                  </td>
                  <td className="py-2.5 px-2 text-[10px] font-bold text-gray-600">
                    {sale.type}
                  </td>
                  <td className="py-2.5 px-2 text-xs font-extrabold text-[#1B2559]">
                    {sale.total}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${sale.statusColor}`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Product Grid */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
        <h3 className="text-lg font-bold text-[#1B2559] mb-5">
          สินค้าใกล้หมดอายุ
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPIRING_PRODUCTS.map((prod, idx) => (
            <div
              key={idx}
              className="bg-[#F8F9FD] rounded-[24px] p-4 border border-gray-100/50 flex flex-col items-center text-center group hover:shadow-lg transition-all"
            >
              <div className="relative mb-3 h-20 flex items-center justify-center">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="text-sm font-bold text-[#1B2559] mb-1">
                {prod.name}
              </h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase">
                {prod.expiry}
              </p>
              <p className="text-xs font-black text-[#1B2559]">{prod.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
