import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Wallet,
  Banknote,
  QrCode,
  HandCoins,
  LogOut,
  DollarSign,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useBranch } from "../contexts/BranchContext";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100">
        <p className="font-black text-gray-900 border-b border-gray-50 pb-2 mb-2 uppercase text-[10px] tracking-widest">
          {payload[0].payload.name}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-8"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-bold text-inactive">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-black text-gray-900">
                ฿{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const FinancePage = () => {
  const { activeBranchName } = useBranch();
  const financeTopics = [
    {
      id: 1,
      title: "รายรับทั้งหมด",
      amount: "200,403",
      subtext: "+8% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-primary",
      color: "bg-orange-50",
      iconBg: "bg-primary",
      icon: TrendingUp,
    },
    {
      id: 2,
      title: "รายจ่ายทั้งหมด",
      amount: "300",
      subtext: "+5% จาก เมื่อวาน",
      subtextColor: "text-inactive",
      color: "bg-gray-50",
      iconBg: "bg-slate-400",
      icon: TrendingDown,
    },
    {
      id: 3,
      title: "กำไรสุทธิ",
      amount: "5,503,900",
      subtext: "+1.2% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-primary",
      color: "bg-primary/10",
      iconBg: "bg-primary-dark",
      icon: Coins,
    },
    {
      id: 4,
      title: "ยอดเงินทั้งหมด",
      amount: "8,950,402",
      subtext: "0.5% จากเมื่อวาน",
      subtextColor: "text-primary",
      color: "bg-orange-50",
      iconBg: "bg-primary",
      icon: Wallet,
    },
  ];

  // Mock Data for Graph (00:00 - 23:00)
  const data = [
    { name: "00", income: 12000, expense: 8000 },
    { name: "01", income: 15000, expense: 12000 },
    { name: "02", income: 22000, expense: 18000 },
    { name: "03", income: 35000, expense: 28000 },
    { name: "04", income: 55000, expense: 45000 },
    { name: "05", income: 75000, expense: 68000 },
    { name: "06", income: 85000, expense: 72000 },
    { name: "07", income: 80000, expense: 65000 },
    { name: "08", income: 72000, expense: 60000 },
    { name: "09", income: 65000, expense: 55000 },
    { name: "10", income: 55000, expense: 48000 },
    { name: "11", income: 48000, expense: 42000 },
    { name: "12", income: 45000, expense: 40000 },
    { name: "13", income: 42000, expense: 38000 },
    { name: "14", income: 38000, expense: 32000 },
    { name: "15", income: 32000, expense: 30000 },
    { name: "16", income: 38000, expense: 35000 },
    { name: "17", income: 32000, expense: 30000 },
    { name: "18", income: 28000, expense: 28000 },
    { name: "19", income: 25000, expense: 20000 },
    { name: "20", income: 18000, expense: 15000 },
    { name: "21", income: 12000, expense: 8000 },
    { name: "22", income: 10000, expense: 7000 },
    { name: "23", income: 8000, expense: 5000 },
  ];

  const paymentChannels = [
    {
      id: 1,
      name: "เงินสด",
      amount: "45,430",
      percent: 77,
      color: "bg-primary",
      icon: Banknote,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      id: 2,
      name: "PromtPay",
      amount: "32,031",
      percent: 20,
      color: "bg-primary",
      icon: QrCode,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      id: 3,
      name: "ค้างชำระ",
      amount: "5,510",
      percent: 13,
      color: "bg-rose-500",
      icon: HandCoins,
      iconBg: "bg-rose-100 text-rose-600",
    },
  ];

  const recentTransactions = [
    {
      id: "TXN-001",
      date: "20-12-2025",
      detail: "ขายสินค้า - คุณสมชาย",
      type: "รายรับ",
      amount: "฿1,250",
      status: "สำเร็จ",
    },
    {
      id: "TXN-002",
      date: "20-12-2025",
      detail: "ซื้อสินค้าเข้า - บริษัท ABC",
      type: "รายจ่าย",
      amount: "฿8,500",
      status: "สำเร็จ",
    },
    {
      id: "TXN-003",
      date: "19-12-2025",
      detail: "ขายสินค้า - ร้านค้าส่ง XYZ",
      type: "รายรับ",
      amount: "฿5,600",
      status: "สำเร็จ",
    },
    {
      id: "TXN-004",
      date: "19-12-2025",
      detail: "ค่าไฟฟ้า",
      type: "รายจ่าย",
      amount: "฿2,300",
      status: "รอดำเนินการ",
    },
    {
      id: "TXN-005",
      date: "18-12-2025",
      detail: "ขายสินค้า - คุณสมหญิง",
      type: "รายรับ",
      amount: "฿890",
      status: "สำเร็จ",
    },
    {
      id: "TXN-006",
      date: "18-12-2025",
      detail: "ค่าเช่า",
      type: "รายจ่าย",
      amount: "฿15,000",
      status: "สำเร็จ",
    },
    {
      id: "TXN-007",
      date: "17-12-2025",
      detail: "ขายสินค้า - บริษัท DEF",
      type: "รายรับ",
      amount: "฿12,500",
      status: "สำเร็จ",
    },
  ];

  const monthlyData = [
    { name: "Jan", รายรับ: 45000, รายจ่าย: 32000 },
    { name: "Feb", รายรับ: 52000, รายจ่าย: 35000 },
    { name: "Mar", รายรับ: 48000, รายจ่าย: 30000 },
    { name: "Apr", รายรับ: 61000, รายจ่าย: 42000 },
    { name: "May", รายรับ: 55000, รายจ่าย: 38000 },
    { name: "Jun", รายรับ: 67000, รายจ่าย: 45000 },
  ];

  return (
    <>
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[5%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative pb-10 space-y-6 min-h-screen">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <DollarSign className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight flex items-center gap-2">
                การเงิน
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                รายงานการเงินของสาขา กำไรขาดทุน และการวิเคราะห์ทางการเงิน
              </p>
            </div>
          </div>
        </div>

        {/* 4 Cards - High Dimension */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {financeTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-premium hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden group min-h-[140px] flex items-center"
            >
              {/* Edge lighting */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>

              {/* Background Glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${topic.color}`}
              />

              {/* Decorative Background Icon */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none transform rotate-12 group-hover:rotate-0">
                <topic.icon size={120} strokeWidth={1} className={topic.iconBg.replace("bg-", "text-")} />
              </div>

              <div className="flex w-full justify-between items-center relative z-10 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                      {topic.title}
                    </p>
                    <div
                      className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-inner-light ${topic.color} ${topic.iconBg.replace("bg-", "text-")}/60 border-current/10`}
                    >
                      Active
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
                      <span className="text-lg mr-1 opacity-40 italic">฿</span>
                      {topic.amount}
                    </h3>
                    <p
                      className={`text-[11px] font-black mt-1 flex items-center gap-1.5 ${topic.subtextColor}`}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                      {topic.subtext}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-premium group-hover:rotate-6 transition-all duration-500 ${topic.color} ${topic.iconBg.replace("bg-", "border-")}/20`}
                >
                  <topic.icon
                    size={28}
                    strokeWidth={2.5}
                    className={topic.iconBg.replace("bg-", "text-")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-premium relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                กระแสเงินรายวัน
              </h2>
              <p className="text-inactive text-[10px] font-black uppercase tracking-widest">
                Daily Cash Flow
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/20"></span>
                <span className="text-sm text-inactive font-bold">เงินเข้า</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400 shadow-sm shadow-slate-200"></span>
                <span className="text-sm text-inactive font-bold">เงินออก</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#E2E8F0",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#ED7117"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="เงินเข้า"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#94A3B8"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="เงินออก"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Payment Channels Section */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-gray-100 shadow-premium relative overflow-hidden">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">
              ช่องทางการชำระเงิน
            </h2>
            <div className="flex flex-col gap-6">
              {paymentChannels.map((channel) => (
                <div key={channel.id} className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${channel.iconBg}`}
                  >
                    <channel.icon size={22} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-900 font-bold tracking-tight">
                        {channel.name}
                      </span>
                      <div className="text-right">
                        <p className="text-gray-900 font-black tracking-tighter">
                          ฿{channel.amount}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${channel.color}`}
                        style={{ width: `${channel.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="lg:col-span-8 bg-white rounded-[32px] p-8 border border-gray-100 shadow-premium relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                รายการล่าสุด
              </h2>
              <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/20">
                <LogOut size={16} strokeWidth={2.5} />
                Export
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left py-4 px-4 text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                      รายการ
                    </th>
                    <th className="text-left py-4 px-4 text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                      วันที่
                    </th>
                    <th className="text-left py-4 px-4 text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                      ประเภท
                    </th>
                    <th className="text-left py-4 px-4 text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                      จำนวน
                    </th>
                    <th className="text-left py-4 px-4 text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentTransactions.map((tx, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-xs font-bold text-inactive">
                        {tx.id}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-inactive">
                        {tx.date}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900">
                        {tx.type}
                      </td>
                      <td
                        className={`py-4 px-4 text-sm font-black ${tx.type === "รายรับ" ? "text-primary" : "text-inactive"}`}
                      >
                        {tx.amount}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === "สำเร็จ" ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary border border-primary/10"}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Monthly Summary Section */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-premium relative overflow-hidden">
          <div className="mb-8 relative z-10">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              สรุปรายเดือน
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 0, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-inactive font-bold text-xs ml-2 uppercase tracking-widest">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="รายรับ"
                  fill="#ED7117"
                  barSize={32}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="รายจ่าย"
                  fill="#94A3B8"
                  barSize={32}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancePage;
