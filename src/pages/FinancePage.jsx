import React from "react";
import { TrendingUp, TrendingDown, Coins, Wallet, Banknote, QrCode, HandCoins, LogOut } from "lucide-react";
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
  Legend
} from "recharts";
<<<<<<< Updated upstream

const FinancePage = () => {
=======
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

>>>>>>> Stashed changes
  const financeTopics = [
    {
      id: 1,
      title: "รายรับทั้งหมด",
      amount: "200,403",
      subtext: "+8% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#FFE2E5]", // Light Pink
      iconBg: "bg-[#FA5A7D]", // Deep Pink
      icon: TrendingUp,
    },
    {
      id: 2,
      title: "รายจ่ายทั้งหมด",
      amount: "300",
      subtext: "+5% จาก เมื่อวาน",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#FFF4DE]", // Light Orange
      iconBg: "bg-[#FF947A]", // Deep Orange
      icon: TrendingDown,
    },
    {
      id: 3,
      title: "กำไรสุทธิ",
      amount: "5,503,900",
      subtext: "+1.2% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#DCFCE7]", // Light Green
      iconBg: "bg-[#3CD856]", // Deep Green
      icon: Coins,
    },
    {
      id: 4,
      title: "ยอดเงินทั้งหมด",
      amount: "8,950,402",
      subtext: "0.5% จากเมื่อวาน",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#F3E8FF]", // Light Purple
      iconBg: "bg-[#BF83FF]", // Deep Purple
      icon: Wallet,
    },
  ];

<<<<<<< Updated upstream
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
      color: "bg-orange-500",
      icon: Banknote,
      iconBg: "bg-teal-700",
    },
    {
      id: 2,
      name: "PromtPay",
      amount: "32,031",
      percent: 20,
      color: "bg-blue-500",
      icon: QrCode,
      iconBg: "bg-white border text-blue-500", // Special case for PromptPay logo look
    },
    {
      id: 3,
      name: "ค้างชำระ",
      amount: "5,510",
      percent: 13,
      color: "bg-red-500",
      icon: HandCoins,
      iconBg: "bg-orange-100 text-orange-600",
    },
  ];

  const recentTransactions = [
    { id: "TXN-001", date: "20-12-2025", detail: "ขายสินค้า - คุณสมชาย", type: "รายรับ", amount: "฿1,250", status: "สำเร็จ" },
    { id: "TXN-002", date: "20-12-2025", detail: "ซื้อสินค้าเข้า - บริษัท ABC", type: "รายจ่าย", amount: "฿8,500", status: "สำเร็จ" },
    { id: "TXN-003", date: "19-12-2025", detail: "ขายสินค้า - ร้านค้าส่ง XYZ", type: "รายรับ", amount: "฿5,600", status: "สำเร็จ" },
    { id: "TXN-004", date: "19-12-2025", detail: "ค่าไฟฟ้า", type: "รายจ่าย", amount: "฿2,300", status: "รอดำเนินการ" },
    { id: "TXN-005", date: "18-12-2025", detail: "ขายสินค้า - คุณสมหญิง", type: "รายรับ", amount: "฿890", status: "สำเร็จ" },
    { id: "TXN-006", date: "18-12-2025", detail: "ค่าเช่า", type: "รายจ่าย", amount: "฿15,000", status: "สำเร็จ" },
    { id: "TXN-007", date: "17-12-2025", detail: "ขายสินค้า - บริษัท DEF", type: "รายรับ", amount: "฿12,500", status: "สำเร็จ" },
  ];

  const monthlyData = [
    { name: "Jan", รายรับ: 45000, รายจ่าย: 32000 },
    { name: "Feb", รายรับ: 52000, รายจ่าย: 35000 },
    { name: "Mar", รายรับ: 48000, รายจ่าย: 30000 },
    { name: "Apr", รายรับ: 61000, รายจ่าย: 42000 },
    { name: "May", รายรับ: 55000, รายจ่าย: 38000 },
    { name: "Jun", รายรับ: 67000, รายจ่าย: 45000 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">08/01/67</p>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-orange-400">
              เงินเข้า <br/> <span className="text-black text-lg">{payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-sm font-medium text-purple-400">
              เงินออก <br/> <span className="text-black text-lg">{payload[1].value.toLocaleString()}</span>
            </p>
=======
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
>>>>>>> Stashed changes
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-10 space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-gray-500">จัดการติดตามรายรับรายจ่าย</p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financeTopics.map((topic) => (
          <div
            key={topic.id}
            className={`${topic.color} border-none rounded-[24px] p-4 shadow-sm relative overflow-hidden h-[180px] flex flex-col`}
          >
            <div className={`w-12 h-12 rounded-full ${topic.iconBg} flex items-center justify-center text-white mb-4`}>
              <topic.icon size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-extrabold text-[#1B2559]">{topic.amount}</h3>
              <p className="text-sm font-medium text-gray-600">{topic.title}</p>
              <p className={`text-xs font-medium ${topic.subtextColor} mt-1`}>{topic.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559]">กระแสเงินรายวัน</h2>
            <p className="text-gray-500">Chain ratio</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                <span className="text-sm text-gray-500">เงินเข้า</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                <span className="text-sm text-gray-500">เงินออก</span>
             </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E0E0E0', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#FB923C" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#FB923C' }} 
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#A78BFA" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#A78BFA' }} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Payment Channels Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#1B2559] mb-6">ช่องทางการชำระเงิน</h2>
        <div className="flex flex-col gap-6">
          {paymentChannels.map((channel) => (
            <div key={channel.id} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${channel.iconBg} flex items-center justify-center shrink-0`}>
                <channel.icon size={24} className={channel.iconBg.includes('text') ? '' : 'text-white'} />
=======
              {/* Decorative Background Icon */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none transform rotate-12 group-hover:rotate-0">
                <topic.icon
                  size={120}
                  strokeWidth={1}
                  className={topic.iconBg.replace("bg-", "text-")}
                />
>>>>>>> Stashed changes
              </div>
              
              <div className="flex-1">
                 <div className="flex justify-between mb-2">
                    <span className="text-[#1B2559] font-bold">{channel.name}</span>
                    <div className="text-right">
                       <p className="text-[#1B2559] font-bold">{channel.amount}</p>
                       <p className="text-gray-500 text-xs">{channel.percent}%</p>
                    </div>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${channel.color}`} 
                      style={{ width: `${channel.percent}%` }}
                    ></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Recent Transactions Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1B2559]">รายการล่าสุด</h2>
          <button className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors">
            <LogOut size={16} />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm rounded-l-lg">เลขที่รายการ</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">วันที่</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">รายละเอียด</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">ประเภท</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">จำนวนเงิน</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm rounded-r-lg">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, index) => (
                <tr key={index} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-600 text-sm">{tx.id}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{tx.date}</td>
                  <td className="py-4 px-4 text-gray-800 text-sm font-medium">{tx.detail}</td>
                  <td className={`py-4 px-4 text-sm font-medium ${tx.type === 'รายรับ' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'รายรับ' ? '↗' : '↘'} {tx.type}
                  </td>
                  <td className={`py-4 px-4 text-sm font-medium ${tx.type === 'รายรับ' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'รายรับ' ? '+' : '-'}{tx.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${tx.status === 'สำเร็จ' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
=======
        {/* Chart Section */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-premium relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                กระแสเงินรายวัน
              </h2>
              <p className="text-inactive text-[10px] font-black uppercase tracking-widest">
                Daily Cash Flow
              </p>
            </div>

            {/* View Mode Selectors */}
            <div className="flex items-center bg-gray-50/70 p-1.5 rounded-2xl border border-gray-100">
              {["day", "month", "year"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    viewMode === mode
                      ? "bg-white text-primary shadow-premium scale-105"
                      : "text-inactive hover:text-gray-900"
                  }`}
                >
                  {mode === "day" ? "วัน" : mode === "month" ? "เดือน" : "ปี"}
                </button>
              ))}
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-premium">
              <button
                onClick={handlePrevDate}
                className="w-8 h-8 flex items-center justify-center text-inactive hover:text-primary transition-all hover:bg-primary/10 rounded-xl"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-2.5 min-w-[120px] justify-center">
                <Calendar size={15} className="text-primary opacity-60" />
                <span className="text-[13px] font-black text-gray-900 tabular-nums tracking-tight">
                  {formatSelectedDate()}
                </span>
              </div>
              <button
                onClick={handleNextDate}
                className="w-8 h-8 flex items-center justify-center text-inactive hover:text-primary transition-all hover:bg-primary/10 rounded-xl"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-300 ring-4 ring-orange-50" />
                <span className="text-[11px] text-gray-900 font-black uppercase tracking-widest leading-none">
                  รายรับ
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm shadow-slate-200 ring-4 ring-slate-50" />
                <span className="text-[11px] text-gray-900 font-black uppercase tracking-widest leading-none">
                  รายจ่าย
                </span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyGraphData}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
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
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 900 }}
                  dy={15}
                  interval={viewMode === "day" ? 2 : 0}
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
>>>>>>> Stashed changes
        </div>
      </div>

      {/* Monthly Summary Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1B2559]">สรุปรายเดือน</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="rect"
                formatter={(value) => <span className="text-gray-500 ml-2">{value}</span>}
              />
              <Bar 
                dataKey="รายรับ" 
                fill="#10B981" 
                barSize={30} 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="รายจ่าย" 
                fill="#EF4444" 
                barSize={30} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
