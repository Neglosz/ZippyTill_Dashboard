import React, { useState } from "react";
import {
  FileText,
  Banknote,
  User,
  Search,
  Phone,
  Calendar,
  PenLine,
  Trash2,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const OverduePage = () => {
  const [activeTab, setActiveTab] = useState("overdue");

  const [overdueItems, setOverdueItems] = useState([
    {
      id: 1,
      name: "วินัย มานะสมชื่อ",
      phone: "083-123-4567",
      amount: 250.0,
      dueDate: "05/12/2025",
      status: "ค้างชำระ",
      overdueDays: 7,
    },
    {
      id: 2,
      name: "สมชาย ใจดี",
      phone: "089-999-9999",
      amount: 1500.0,
      dueDate: "01/12/2025",
      status: "ค้างชำระ",
      overdueDays: 12,
    },
    {
      id: 3,
      name: "มานี มีแชร์",
      phone: "081-555-4444",
      amount: 4500.5,
      dueDate: "15/11/2025",
      status: "ค้างชำระ",
      overdueDays: 28,
    },
  ]);

  const paidItems = [
    {
      id: 1,
      name: "สมศรี มีตังค์",
      phone: "081-999-8888",
      amount: "500.00",
      paidDate: "05/01/2026",
      dueDate: "01/01/2026",
    },
  ];

  // Derived State
  const totalOverdueAmount = overdueItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalOverdueCount = overdueItems.length;
  // Mock 'Near Due' logic: let's say overdueDays < 7 is 'Near Due' or we can mock it.
  // For now let's say "Recently Overdue" (within 7 days)
  const recentOverdueCount = overdueItems.filter(
    (item) => item.overdueDays <= 7
  ).length;

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบรายการนี้ใช่ไหม?")) {
      setOverdueItems(overdueItems.filter((item) => item.id !== id));
    }
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: All Items (Pink) */}
        <div className="bg-[#FFE2E5] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              รายการทั้งหมด
            </p>
            <p className="text-[#1B2559] text-3xl font-bold">
              {totalOverdueCount}
            </p>
          </div>
          <div className="h-10 w-10 bg-[#FF9AA2] rounded-full flex items-center justify-center text-white">
            <FileText size={20} />
          </div>
        </div>

        {/* Card 2: Total Amount (Green) */}
        <div className="bg-[#DCFCE7] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              ยอดรวมค้างชำระ:
            </p>
            <p className="text-[#1B2559] text-3xl font-bold">
              ฿{totalOverdueAmount.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 bg-[#3CD856] rounded-full flex items-center justify-center text-white">
            <Banknote size={20} />
          </div>
        </div>

        {/* Card 3: Near Due (Yellow) */}
        <div className="bg-[#FFF4DE] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              เพิ่งเกินกำหนด (7วัน)
            </p>
            <p className="text-[#1B2559] text-3xl font-bold">
              {recentOverdueCount} คน
            </p>
          </div>
          <div className="h-10 w-10 bg-[#FFB547] rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
        </div>
      </div>

      {/* Tools Bar */}
      <div className="bg-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-96 bg-[#F4F7FE] rounded-full overflow-hidden">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500">
            <Search size={20} className="text-[#6d28d9]" />
          </div>
          <input
            type="text"
            placeholder="Search here..."
            className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 outline-none"
          />
        </div>

        <div className="flex bg-[#F4F7FE] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "overdue"
                ? "bg-white text-gray-700 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ค้างชำระ
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "paid"
                ? "bg-white text-gray-700 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ชำระแล้ว
          </button>
        </div>
      </div>

      {/* Main List Area (Empty for now as per design) */}
      {/* Main List Area */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Mockup Data */}
          {activeTab === "overdue"
            ? /* Overdue Items */
              overdueItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[20px] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col justify-between h-full group"
                >
                  <div>
                    {/* Header: Name & Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1B2559] mb-1 group-hover:text-[#6d28d9] transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone size={14} />
                          <span className="text-sm font-medium">
                            {item.phone}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-full bg-red-50 px-3 py-1 border border-red-100">
                        <span className="text-xs font-bold text-red-500">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Content: Amounts */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 border border-gray-100">
                      <div className="flex justify-between items-end mb-3 pb-3 border-b border-gray-100 border-dashed">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium mb-1">
                            ยอดคงเหลือ
                          </span>
                          <span className="text-2xl font-bold text-[#1B2559]">
                            ฿{Math.floor(item.amount).toLocaleString()}
                            <span className="text-lg text-gray-400">
                              .{(item.amount % 1).toFixed(2).substring(2)}
                            </span>
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-full shadow-sm text-[#6d28d9]">
                          <DollarSign size={18} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={14} />
                          <span className="text-xs font-medium">
                            ครบกำหนด {item.dueDate}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-red-400 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                          {item.overdueDays} วัน
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold shadow-sm">
                      <PenLine size={16} />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-all text-sm font-semibold shadow-md shadow-red-200"
                    >
                      <Trash2 size={16} />
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            : /* Paid Items */
              paidItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[20px] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col justify-between h-full group opacity-80 hover:opacity-100"
                >
                  <div>
                    {/* Header: Name & Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1B2559] mb-1 group-hover:text-teal-600 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone size={14} />
                          <span className="text-sm font-medium">
                            {item.phone}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-full bg-teal-50 px-3 py-1 border border-teal-100 flex items-center gap-1">
                        <CheckCircle size={10} className="text-teal-500" />
                        <span className="text-xs font-bold text-teal-600">
                          ชำระแล้ว
                        </span>
                      </div>
                    </div>

                    {/* Content: Amounts */}
                    <div className="bg-teal-50/30 rounded-2xl p-4 mb-4 border border-teal-50">
                      <div className="flex justify-between items-end mb-3 pb-3 border-b border-teal-100/50 border-dashed">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium mb-1">
                            ยอดที่ชำระ
                          </span>
                          <span className="text-2xl font-bold text-teal-700">
                            ฿{item.amount}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-full shadow-sm text-teal-500">
                          <Banknote size={18} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={14} />
                          <span className="text-xs font-medium">
                            วันที่ชำระ {item.paidDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions (View Details only?) */}
                  <div className="grid grid-cols-1 gap-3 mt-auto">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all text-sm font-semibold border border-teal-100">
                      <FileText size={16} />
                      ดูใบเสร็จ
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default OverduePage;
