import React, { useState, useEffect } from "react";
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
  CreditCard,
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
import { saleService } from "../services/saleService";
import { orderService } from "../services/orderService";
import { transactionService } from "../services/transactionService";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-float border border-white/50 min-w-[160px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <p className="font-black text-gray-900 text-xs tracking-widest uppercase">
            {label}
          </p>
        </div>
        <div className="space-y-3">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-lg shadow-sm"
                  style={{
                    background: entry.color.includes("url")
                      ? entry.dataKey === "income"
                        ? "#ED7117"
                        : "#94A3B8"
                      : entry.color,
                  }}
                />
                <span className="text-[11px] font-bold text-inactive uppercase">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-black text-gray-900 tabular-nums">
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
  const { activeBranchId } = useBranch();
  const [loading, setLoading] = useState(true);

  // Data States
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    paymentChannels: [],
  });
  const [dailyGraphData, setDailyGraphData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Filters State
  const [viewMode, setViewMode] = useState("day"); // 'day', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (activeBranchId) {
      fetchFinanceData();
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (activeBranchId) {
      fetchChartData();
    }
  }, [activeBranchId, viewMode, selectedDate]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [stats, recentOrders] = await Promise.all([
        transactionService.getFinanceStats(activeBranchId),
        orderService.getRecentOrders(activeBranchId),
      ]);

      setMetrics(stats);
      setTransactions(recentOrders || []);
    } catch (error) {
      console.error("Failed to fetch finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const data = await transactionService.getAggregatedTransactions(
        activeBranchId,
        viewMode,
        selectedDate,
      );
      setDailyGraphData(data);
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  };

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === "day") newDate.setDate(selectedDate.getDate() - 1);
    else if (viewMode === "month")
      newDate.setMonth(selectedDate.getMonth() - 1);
    else if (viewMode === "year")
      newDate.setFullYear(selectedDate.getFullYear() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === "day") newDate.setDate(selectedDate.getDate() + 1);
    else if (viewMode === "month")
      newDate.setMonth(selectedDate.getMonth() + 1);
    else if (viewMode === "year")
      newDate.setFullYear(selectedDate.getFullYear() + 1);
    setSelectedDate(newDate);
  };

  const formatSelectedDate = () => {
    if (viewMode === "day")
      return selectedDate.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    if (viewMode === "month")
      return selectedDate.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      });
    return selectedDate.toLocaleDateString("th-TH", { year: "numeric" });
  };

  const financeTopics = [
    {
      id: 1,
      title: "รายรับทั้งหมด",
      amount: metrics.totalRevenue.toLocaleString(),
      subtext: "ยอดขายรวมทั้งหมด",
      subtextColor: "text-primary",
      color: "bg-orange-50",
      iconBg: "bg-primary",
      icon: TrendingUp,
    },
    {
      id: 2,
      title: "ต้นทุนขาย (COGS)",
      amount: metrics.totalExpense.toLocaleString(),
      subtext: "คิดจากต้นทุนสินค้า",
      subtextColor: "text-inactive",
      color: "bg-gray-50",
      iconBg: "bg-slate-400",
      icon: TrendingDown,
    },
    {
      id: 3,
      title: "กำไรขั้นต้น",
      amount: metrics.netProfit.toLocaleString(),
      subtext: "รายรับ - ต้นทุนขาย",
      subtextColor: "text-primary",
      color: "bg-primary/10",
      iconBg: "bg-primary-dark",
      icon: Coins,
    },
    {
      id: 4,
      title: "ยอดเงินสุทธิ",
      amount: metrics.netProfit.toLocaleString(), // Using Net Profit as substitute for now
      subtext: "Balance",
      subtextColor: "text-primary",
      color: "bg-orange-50",
      iconBg: "bg-primary",
      icon: Wallet,
    },
  ];

  // Process Payment Channels for display
  const processedChannels = [
    {
      id: "cash",
      name: "เงินสด",
      icon: Banknote,
      color: "bg-primary",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      id: "transfer",
      name: "โอนเงิน",
      icon: QrCode,
      color: "bg-blue-500",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "credit",
      name: "บัตรเครดิต",
      icon: CreditCard,
      color: "bg-purple-500",
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "other",
      name: "อื่นๆ",
      icon: HandCoins,
      color: "bg-gray-500",
      iconBg: "bg-gray-100 text-gray-600",
    },
  ];

  const paymentChannelDisplay = metrics.paymentChannels.map((pc, index) => {
    // Basic mapping based on name or fallback
    let template =
      processedChannels.find(
        (c) => c.name === pc.method || c.id === pc.method,
      ) || processedChannels[3];
    // If exact match not found but we have method name, we can still show it
    return {
      id: index,
      name: pc.method || "ไม่ระบุ",
      amount: pc.amount.toLocaleString(),
      percent: pc.percent,
      color: template.color,
      icon: template.icon,
      iconBg: template.iconBg,
    };
  });

  return (
    <>
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[5%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative pb-10 space-y-6 min-h-screen">
        {/* SVG Definitions for Gradients and Shadows */}
        <svg
          style={{ height: 0, width: 0, position: "absolute" }}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#ED7117" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

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
                <topic.icon
                  size={120}
                  strokeWidth={1}
                  className={topic.iconBg.replace("bg-", "text-")}
                />
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
                <span className="text-sm text-inactive font-bold">
                  เงินเข้า
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400 shadow-sm shadow-slate-200"></span>
                <span className="text-sm text-inactive font-bold">เงินออก</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyGraphData}
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
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(value) =>
                    `฿${value >= 1000 ? (value / 1000).toFixed(1) + "K" : value}`
                  }
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F8FAFC", radius: [10, 10, 0, 0] }}
                />
                <Bar
                  dataKey="income"
                  fill="url(#incomeGradient)"
                  name="รายรับ"
                  radius={[8, 8, 2, 2]}
                  barSize={
                    viewMode === "day" ? 28 : viewMode === "month" ? 14 : 50
                  }
                  style={{ filter: "url(#barShadow)" }}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="expense"
                  fill="url(#expenseGradient)"
                  name="รายจ่าย"
                  radius={[8, 8, 2, 2]}
                  barSize={
                    viewMode === "day" ? 28 : viewMode === "month" ? 14 : 50
                  }
                  style={{ filter: "url(#barShadow)" }}
                  animationDuration={1500}
                />
              </BarChart>
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
              {paymentChannelDisplay.length > 0 ? (
                paymentChannelDisplay.map((channel) => (
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
                ))
              ) : (
                <div className="text-center text-inactive py-8">
                  ไม่มีข้อมูลการชำระเงิน
                </div>
              )}
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
                  {transactions.map((tx, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-xs font-bold text-gray-900">
                        {tx.order_no}
                        <p className="text-[10px] text-inactive font-medium">
                          {tx.customers_info?.name || "ลูกค้าทั่วไป"}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-inactive">
                        {new Date(tx.created_at).toLocaleDateString("th-TH")}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900">
                        {tx.payment_type === "credit_sale"
                          ? "เครดิต"
                          : "เงินสด"}
                      </td>
                      <td
                        className={`py-4 px-4 text-sm font-black text-primary`}
                      >
                        +฿{Number(tx.total_amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                        >
                          {tx.payment_status || "สำเร็จ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-8 text-inactive"
                      >
                        ไม่มีรายการล่าสุด
                      </td>
                    </tr>
                  )}
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
                data={monthlyChartData}
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
