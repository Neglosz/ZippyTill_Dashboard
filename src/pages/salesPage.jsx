import React, { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  Tag,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
} from "lucide-react";
import { saleService } from "../services/saleService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const data1D = [
  { name: "07:00", general: 2400, home: 1800, fresh: 2000, snack: 1500 },
  { name: "08:00", general: 3000, home: 2200, fresh: 2500, snack: 1800 },
  { name: "09:00", general: 3500, home: 2800, fresh: 3000, snack: 2100 },
  { name: "10:00", general: 4100, home: 3100, fresh: 3200, snack: 2400 },
  { name: "11:00", general: 4500, home: 3500, fresh: 3600, snack: 2800 },
  { name: "12:00", general: 4800, home: 3800, fresh: 4100, snack: 3200 },
  { name: "13:00", general: 4200, home: 3400, fresh: 3900, snack: 2900 },
  { name: "14:00", general: 3800, home: 3000, fresh: 3500, snack: 2600 },
  { name: "15:00", general: 3500, home: 2800, fresh: 3100, snack: 2300 },
  { name: "16:00", general: 3900, home: 3200, fresh: 3700, snack: 2700 },
  { name: "17:00", general: 4400, home: 3600, fresh: 4000, snack: 3100 },
  { name: "18:00", general: 4600, home: 3900, fresh: 4200, snack: 3500 },
].map((item) => ({
  name: item.name,
  general: Math.round(item.general + Math.random() * 50),
  home: Math.round(item.home + Math.random() * 50),
  fresh: Math.round(item.fresh + Math.random() * 50),
  snack: Math.round(item.snack + Math.random() * 50),
}));

const data1M = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  general: Math.round(
    2000 + Math.abs(Math.sin(i * 0.5) * 2000) + Math.random() * 500,
  ),
  home: Math.round(
    1500 + Math.abs(Math.cos(i * 0.3) * 2500) + Math.random() * 500,
  ),
  fresh: Math.round(
    1000 + Math.abs(Math.sin(i * 0.2) * 3000) + Math.random() * 500,
  ),
  snack: Math.round(
    2500 + Math.abs(Math.cos(i * 0.4) * 1500) + Math.random() * 500,
  ),
}));

const data1Y = [
  { name: "ม.ค.", general: 4000, home: 2400, fresh: 2400, snack: 2400 },
  { name: "ก.พ.", general: 3000, home: 1398, fresh: 2210, snack: 2290 },
  { name: "มี.ค.", general: 2000, home: 9800, fresh: 2290, snack: 2000 },
  { name: "เม.ย.", general: 2780, home: 3908, fresh: 2000, snack: 2181 },
  { name: "พ.ค.", general: 1890, home: 4800, fresh: 2181, snack: 2500 },
  { name: "มิ.ย.", general: 2390, home: 3800, fresh: 2500, snack: 2100 },
  { name: "ก.ค.", general: 3490, home: 4300, fresh: 2100, snack: 2100 },
  { name: "ส.ค.", general: 4000, home: 2400, fresh: 2400, snack: 2400 },
  { name: "ก.ย.", general: 3000, home: 1398, fresh: 2210, snack: 2290 },
  { name: "ต.ค.", general: 2000, home: 9800, fresh: 2290, snack: 2000 },
  { name: "พ.ย.", general: 2780, home: 3908, fresh: 2000, snack: 2181 },
  { name: "ธ.ค.", general: 1890, home: 4800, fresh: 2181, snack: 2500 },
];

const SalesPage = () => {
  const [timeRange, setTimeRange] = useState("1D");
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ totalProducts: 0, totalSold: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const colors = [
    "#F43F5E", // rose-500
    "#F59E0B", // amber-500
    "#10B981", // emerald-500
    "#3B82F6", // blue-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [topData, catData, summaryData] = await Promise.all([
          saleService.getTopSellingProducts(),
          saleService.getSalesByCategory(),
          saleService.getSalesSummary(),
        ]);
        setTopProducts(topData);
        setSalesSummary(summaryData);

        const totalRevenue = catData.reduce(
          (sum, c) => sum + (c.revenue || 0),
          0
        );
        const processedCatData = catData
          .filter((c) => c.revenue > 0)
          .map((c, index) => ({
            ...c,
            percentage:
              totalRevenue > 0
                ? ((c.revenue / totalRevenue) * 100).toFixed(0)
                : 0,
            color: colors[index % colors.length],
            value: c.revenue, // Recharts uses 'value'
          }))
          .sort((a, b) => b.revenue - a.revenue);

        setCategorySales(processedCatData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setFetchError("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 1,
      title: "ยอดขายรวม",
      amount: "฿" + categorySales.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString(),
      subtext: "+8% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-[#4079ED]",
      color: "bg-rose-50",
      iconBg: "bg-rose-500",
      icon: BarChart3,
    },
    {
      id: 2,
      title: "จำนวนสินค้าทั้งหมด",
      amount: salesSummary.totalProducts.toLocaleString(),
      subtext: "+5% จาก เมื่อวาน",
      subtextColor: "text-[#4079ED]",
      color: "bg-amber-50",
      iconBg: "bg-amber-500",
      icon: FileText,
    },
    {
      id: 3,
      title: "จำนวนสินค้าที่ขายไปแล้ว",
      amount: salesSummary.totalSold.toLocaleString(),
      subtext: "+1.2% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-[#4079ED]",
      color: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      icon: Tag,
    },
  ];

  const getChartData = () => {
    switch (timeRange) {
      case "1D":
        return data1D;
      case "1M":
        return data1M;
      case "1Y":
        return data1Y;
      case "Max":
        return data1Y;
      default:
        return data1D;
    }
  };

  // Pie Chart Data
  const pieData =
    categorySales.length > 0
      ? categorySales
      : [{ name: "ไม่มีข้อมูล", value: 1, color: "#F1F5F9", percentage: 0 }];

  return (
    <>
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[110px]" />
      </div>

      <div className="flex flex-col gap-8 pb-10">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <ShoppingCart
                className="w-10 h-10 text-primary"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                Sales Overview
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                สรุปภาพรวมยอดขายและสถิติสินค้าที่สำคัญ
              </p>
            </div>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((topic) => (
            <div
              key={topic.id}
              className="bg-white border border-gray-100 rounded-[32px] p-7 shadow-premium hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Edge lighting */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${topic.color}`}
              />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm group-hover:rotate-6 transition-transform ${topic.color} ${topic.iconBg.replace("bg-", "border-")}/20`}
                >
                  <topic.icon
                    size={24}
                    strokeWidth={2.5}
                    className={topic.iconBg.replace("bg-", "text-")}
                  />
                </div>
                <div
                  className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-inner-light ${topic.color} ${topic.iconBg.replace("bg-", "text-")}/60 border-current/10`}
                >
                  Active
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2.5">
                  {topic.title}
                </p>
                <div className="flex flex-col gap-1">
                  <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
                    {topic.amount}
                  </h3>
                  <p
                    className={`text-[10px] font-black mt-2 flex items-center gap-1.5 ${topic.subtextColor}`}
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-current opacity-50" />
                    {topic.subtext}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Chart: Total Sales */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-premium border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                    สถิติยอดขาย
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">
                  ฿{categorySales.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1.5">
                {["1D", "1M", "1Y", "Max"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${timeRange === range
                      ? "bg-white shadow-sm text-primary border border-gray-100"
                      : "text-inactive hover:text-gray-900"
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getChartData()}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="5 5"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
                    width={60}
                    tickCount={6}
                    domain={[0, "auto"]}
                    tickFormatter={(value) =>
                      value === 0
                        ? "0"
                        : value >= 1000
                          ? `${(value / 1000).toFixed(0)}k`
                          : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid #F1F5F9",
                      boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.05)",
                      padding: "12px 16px",
                    }}
                    labelStyle={{
                      fontWeight: 900,
                      color: "#1E293B",
                      marginBottom: "8px",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                    itemStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 0",
                    }}
                    labelFormatter={(value) =>
                      timeRange === "1M" ? `วันที่ ${value}` : value
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="general"
                    stroke="#F43F5E"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="ของใช้ทั่วไป"
                  />
                  <Line
                    type="monotone"
                    dataKey="home"
                    stroke="#F59E0B"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="ของใช้ในบ้าน"
                  />
                  <Line
                    type="monotone"
                    dataKey="fresh"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="ของสด"
                  />
                  <Line
                    type="monotone"
                    dataKey="snack"
                    stroke="#10B981"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="ขนม"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-6 bg-gray-50 rounded-[28px] border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></span>
                <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                  ของใช้ทั่วไป
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                  ของสด
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>
                <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                  ของใช้ในบ้าน
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                  ขนม
                </span>
              </div>
            </div>
          </div>

          {/* Right Chart: Income Structure */}
          <div className="bg-white p-8 rounded-[32px] shadow-premium border border-gray-100 flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                  โครงสร้างรายได้
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">
                ฿{categorySales.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}
              </p>
            </div>

            <div className="flex-1 min-h-[280px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={10}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid #F1F5F9",
                      boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.05)",
                    }}
                    itemStyle={{
                      fontSize: "12px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                  Total
                </span>
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  100%
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {pieData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-[10px] font-black text-inactive uppercase tracking-widest group-hover:text-gray-900 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900 tracking-tighter">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Products Section */}
        <div className="bg-white p-8 rounded-[32px] shadow-premium border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              สินค้าขายดี Top 5
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-inactive text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-6 pl-4">อันดับ</th>
                  <th className="pb-6 pl-4">รูปสินค้า</th>
                  <th className="pb-6">ชื่อสินค้า</th>
                  <th className="pb-6">ยอดขาย</th>
                  <th className="pb-6">รายได้</th>
                  <th className="pb-6">แนวโน้ม</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-inactive font-bold"
                    >
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-rose-500 font-bold"
                    >
                      {fetchError}
                    </td>
                  </tr>
                ) : topProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-inactive font-bold"
                    >
                      ไม่พบข้อมูลรายการสินค้า
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all group"
                      >
                        <td className="py-6 pl-4 font-black">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm
                            ${rank === 1
                                ? "bg-amber-400 text-white shadow-amber-200"
                                : rank === 2
                                  ? "bg-slate-400 text-white shadow-slate-200"
                                  : rank === 3
                                    ? "bg-orange-400 text-white shadow-orange-200"
                                    : "bg-gray-100 text-inactive border border-gray-100"
                              }`}
                          >
                            {rank}
                          </div>
                        </td>
                        <td className="py-6 pl-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform duration-500 group-hover:scale-110">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-6 text-gray-900 font-black tracking-tight">
                          {product.name}
                        </td>
                        <td className="py-6 text-inactive font-bold">
                          {product.sold_qty} ชิ้น
                        </td>
                        <td className="py-6 text-gray-900 font-black tracking-tight">
                          ฿{(product.revenue || product.sold_qty * product.price).toLocaleString()}
                        </td>
                        <td className="py-6">
                          <div
                            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex bg-emerald-50 text-emerald-600 border border-emerald-100`}
                          >
                            {product.sold_qty > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{product.trend || "Stable"}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesPage;
