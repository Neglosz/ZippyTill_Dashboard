import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
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
    change: "+8% จากเมื่อวาน",
    color: "text-rose-500",
    bg: "bg-rose-50",
    icon: FileText,
  },
  {
    label: "ออเดอร์ทั้งหมด",
    value: "300",
    change: "+5% จากเมื่อวาน",
    color: "text-amber-500",
    bg: "bg-amber-50",
    icon: ShoppingCart,
  },
  {
    label: "สินค้าขายออก",
    value: "5",
    change: "+1.2% จากเมื่อวาน",
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
    <div className="space-y-6 pb-10">
      {/* Row 1: Sales Summary | Outstanding | Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Today Card */}
        <div className="lg:col-span-4 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#1B2559]">ยอดขายวันนี้</h3>
              <p className="text-gray-400 text-sm">สรุปการขาย</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all">
              <Download size={14} /> Export
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SALES_METRICS.map((item, idx) => (
              <div
                key={idx}
                className={`${item.bg} rounded-2xl p-4 flex flex-col items-center text-center`}
              >
                <div
                  className={`h-10 w-10 bg-white rounded-xl flex items-center justify-center ${item.color} mb-3 shadow-sm`}
                >
                  <item.icon size={20} />
                </div>
                <p className="text-lg font-extrabold text-[#1B2559] mb-1">
                  {item.value}
                </p>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  {item.label}
                </p>
                <div className="mt-2 flex items-center gap-0.5">
                  <TrendingUp size={10} className={item.color} />
                  <span className={`text-[8px] font-bold ${item.color}`}>
                    {item.change.split(" ")[0]}
                  </span>
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                  จากเมื่อวาน
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total Outstanding Card */}
        <div className="lg:col-span-3 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
          <h3 className="text-xl font-bold text-[#1B2559] mb-8 text-center lg:text-left">
            ยอดค้างชำระทั้งหมด
          </h3>
          <div className="bg-[#F4F1FF] rounded-[24px] p-8 flex flex-col items-center justify-center text-center h-[calc(100%-80px)]">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-[#6d28d9] mb-6 shadow-md">
              <Users size={32} />
            </div>
            <p className="text-3xl font-extrabold text-[#1B2559] mb-1">8 คน</p>
            <p className="text-gray-500 text-sm font-bold mb-4">
              ยอดเงินทั้งหมด
            </p>
            <p className="text-4xl font-black text-[#1B2559]">฿1,930</p>
          </div>
        </div>

        {/* Target vs Sales Chart Placeholder */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#1B2559]">
              เป้าหมาย vs ยอดขาย
            </h3>
            <MoreVertical size={18} className="text-gray-300 cursor-pointer" />
          </div>

          <div className="flex-1 flex flex-col justify-end">
            {/* Custom Bar Chart using CSS */}
            <div className="flex items-end justify-between gap-2 h-48 px-2">
              {[
                { m: "Jan", v1: 60, v2: 40 },
                { m: "Feb", v1: 70, v2: 45 },
                { m: "Mar", v1: 65, v2: 50 },
                { m: "Apr", v1: 85, v2: 60 },
                { m: "May", v1: 75, v2: 55 },
                { m: "June", v1: 95, v2: 70 },
                { m: "July", v1: 90, v2: 65 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center flex-1 gap-1"
                >
                  <div className="w-full flex justify-center gap-1 items-end h-full min-h-[150px]">
                    <div
                      className="w-2.5 bg-[#4318FF] rounded-t-full"
                      style={{ height: `${item.v2}%` }}
                    ></div>
                    <div
                      className="w-2.5 bg-[#F4F7FE] rounded-t-full"
                      style={{ height: `${item.v1}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 mt-2 uppercase">
                    {item.m}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-8 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-50 rounded-md flex items-center justify-center border border-indigo-100">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-sm"></div>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  ยอดขายจริง
                </span>
                <span className="text-xs font-bold text-green-500 uppercase ml-2">
                  8,823
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-50 rounded-md flex items-center justify-center border border-amber-100">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-sm"></div>
                </div>
                <span className="text-xs font-bold text-gray-500">
                  ยอดขายเป้าหมาย
                </span>
                <span className="text-xs font-bold text-amber-500 uppercase ml-2">
                  12,122
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Best Sellers | Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Best Sellers Table */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-[#1B2559] mb-6">สินค้าขายดี</h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4 pr-4">#</th>
                  <th className="pb-4 pr-4">ชื่อ</th>
                  <th className="pb-4 pr-4 w-1/2">ความนิยม</th>
                  <th className="pb-4 text-center">ยอดขาย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {BEST_SELLERS.map((item, idx) => (
                  <tr
                    key={idx}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 text-sm font-bold text-gray-400 pr-4">
                      {(idx + 1).toString().padStart(2, "0")}
                    </td>
                    <td className="py-4 text-sm font-bold text-[#1B2559] pr-4">
                      {item.name}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            idx === 0
                              ? "bg-[#00B5FF]"
                              : idx === 1
                              ? "bg-[#00E096]"
                              : idx === 2
                              ? "bg-[#8833FF]"
                              : "bg-[#FFA41B]"
                          }`}
                          style={{ width: `${item.popularity}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black border ${
                          idx === 0
                            ? "bg-blue-50 text-blue-500 border-blue-100"
                            : idx === 1
                            ? "bg-green-50 text-green-500 border-green-100"
                            : idx === 2
                            ? "bg-purple-50 text-purple-500 border-purple-100"
                            : "bg-amber-50 text-amber-500 border-amber-100"
                        }`}
                      >
                        {item.sales}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#1B2559]">
              รายการการขายล่าสุด
            </h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-100">
              ธันวาคม <ChevronDown size={14} />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4 pr-4">เลขที่บิล</th>
                  <th className="pb-4 pr-4">วันที่-เวลา</th>
                  <th className="pb-4 pr-4">ประเภท</th>
                  <th className="pb-4 pr-4">ยอดรวม</th>
                  <th className="pb-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_SALES.map((sale, idx) => (
                  <tr
                    key={idx}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 pr-4 flex items-center gap-3">
                      <FileText size={16} className="text-gray-300" />
                      <span className="text-sm font-bold text-[#1B2559]">
                        {sale.id}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-gray-500 pr-4">
                      {sale.time}
                    </td>
                    <td className="py-4 text-xs font-bold text-gray-600 pr-4">
                      {sale.type}
                    </td>
                    <td className="py-4 text-sm font-extrabold text-[#1B2559] pr-4">
                      {sale.total}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-4 py-1 rounded-full text-[10px] font-bold text-white ${sale.statusColor} shadow-sm`}
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
      </div>

      {/* Row 3: Expiring Products */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-xl font-bold text-[#1B2559] mb-8">
          รายการสินค้าใกล้หมดอายุ
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPIRING_PRODUCTS.map((prod, idx) => (
            <div
              key={idx}
              className="bg-[#F8F9FD] rounded-3xl p-6 border border-gray-100/50 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-white rounded-full scale-110 shadow-sm opacity-50"></div>
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="relative z-10 w-24 h-32 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="text-lg font-bold text-[#1B2559] mb-3">
                {prod.name}
              </h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                  {prod.expiry}
                </p>
                <p className="text-sm font-black text-[#1B2559] tracking-widest">
                  {prod.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
