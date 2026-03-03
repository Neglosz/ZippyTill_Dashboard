import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart3,
  FileText,
  Tag,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Cookie,
  Coffee,
  Wheat,
  ShoppingBag,
  Snowflake,
  Apple,
  Milk,
  Package,
  MoreHorizontal,
  AlarmClockOff,
} from "lucide-react";
import { saleService } from "../services/saleService";
import { useBranch } from "../contexts/BranchContext";
import { PageHeader, PageBackground } from "../components/common/PageHeader";
import { StatsCard } from "../components/common/StatsCard";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";

const SalesPage = () => {
  const { activeBranchId } = useBranch();
  const [timeRange, setTimeRange] = useState("1D");
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    totalProducts: 0,
    totalSold: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const hasAnimated = useRef(false);

  const colors = useMemo(
    () => [
      "#F43F5E", // rose-500
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#8B5CF6", // violet-500
      "#EC4899", // pink-500
      "#06B6D4", // cyan-500
      "#F97316", // orange-500
    ],
    [],
  );

  // Initial data fetch (one-time)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!activeBranchId) return;
      try {
        setIsLoading(true);
        const [topData, catData, summaryData, histData] = await Promise.all([
          saleService.getTopSellingProducts(activeBranchId),
          saleService.getSalesByCategory(activeBranchId),
          saleService.getSalesSummary(activeBranchId),
          saleService.getSalesHistory(activeBranchId, timeRange),
        ]);
        setTopProducts(topData);
        setSalesSummary(summaryData);
        setHistoryData(histData);

        const totalRevenue = catData.reduce(
          (sum, c) => sum + (c.revenue || 0),
          0,
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
          }));

        setCategorySales(processedCatData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setFetchError("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [activeBranchId, timeRange, colors]);

  // Chart data fetch (whenever timeRange changes)
  useEffect(() => {
    const fetchChartData = async () => {
      if (!activeBranchId || isLoading) return;
      try {
        setIsChartLoading(true);
        const histData = await saleService.getSalesHistory(
          activeBranchId,
          timeRange,
        );
        setHistoryData(histData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchChartData();
  }, [timeRange, activeBranchId, isLoading]);

  const stats = [
    {
      id: 1,
      title: "ยอดขายรวม",
      amount: (() => {
        const totalRevenue = categorySales.reduce(
          (sum, c) => sum + (c.revenue || 0),
          0,
        );
        const roundedRevenue = Math.ceil(totalRevenue);
        console.log(
          "Total Revenue:",
          totalRevenue,
          "→ Rounded:",
          roundedRevenue,
        );
        return "฿" + roundedRevenue.toLocaleString();
      })(),
      color: "bg-rose-50",
      iconBg: "bg-rose-500",
      icon: BarChart3,
    },
    {
      id: 2,
      title: "จำนวนสินค้าทั้งหมด",
      amount: Math.ceil(salesSummary.totalProducts).toLocaleString(),
      color: "bg-amber-50",
      iconBg: "bg-amber-500",
      icon: FileText,
    },
    {
      id: 3,
      title: "จำนวนสินค้าที่ขายไปแล้ว",
      amount: Math.ceil(salesSummary.totalSold).toLocaleString(),
      color: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      icon: Tag,
    },
  ];

  const chartData = useMemo(() => {
    return historyData;
  }, [historyData]);

  // Pie Chart Data
  const pieData =
    categorySales.length > 0
      ? categorySales
      : [{ name: "ไม่มีข้อมูล", value: 1, color: "#F1F5F9", percentage: 0 }];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-inactive uppercase tracking-widest animate-pulse">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBackground />

      <div className="flex flex-col gap-8 pb-10">
        <PageHeader
          title="ยอดขาย"
          description="สรุปภาพรวมยอดขายและสถิติสินค้าที่สำคัญ"
          icon={ShoppingCart}
        />

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((topic) => (
            <StatsCard key={topic.id} {...topic} />
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
                  ฿
                  {Math.ceil(
                    categorySales.reduce((sum, c) => sum + (c.revenue || 0), 0),
                  ).toLocaleString()}
                </p>
              </div>
              <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1.5">
                {["1D", "1W", "1M", "1Y"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      timeRange === range
                        ? "bg-white shadow-sm text-primary border border-gray-100"
                        : "text-inactive hover:text-gray-900"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[350px] w-full relative">
              {isChartLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-[32px]">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ED7117" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#F97316"
                        stopOpacity={0.9}
                      />
                    </linearGradient>
                    <linearGradient
                      id="barGradientActive"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FFB347" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF8C00" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ED7117"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="100%"
                        stopColor="#ED7117"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                    <filter
                      id="barShadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur
                        in="SourceAlpha"
                        stdDeviation="4"
                        result="blur"
                      />
                      <feOffset dx="0" dy="8" in="blur" result="offsetBlur" />
                      <feFlood
                        floodColor="#ED7117"
                        floodOpacity="0.3"
                        result="offsetColor"
                      />
                      <feComposite
                        in="offsetColor"
                        in2="offsetBlur"
                        operator="in"
                        result="shadow"
                      />
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
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
                    cursor={false}
                    contentStyle={{
                      borderRadius: "24px",
                      border: "none",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                      padding: "16px 20px",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      zIndex: 1000,
                    }}
                    labelStyle={{
                      fontWeight: 900,
                      color: "#1E293B",
                      marginBottom: "6px",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                    itemStyle={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#ED7117",
                      padding: "0",
                    }}
                    labelFormatter={(value) =>
                      timeRange === "1M" ? `วันที่ ${value}` : value
                    }
                  />
                  <Bar
                    dataKey="totalSales"
                    fill="url(#barGradient)"
                    radius={[10, 10, 2, 2]}
                    name="ยอดขายรวม"
                    barSize={timeRange === "1M" ? 8 : 24}
                    isAnimationActive={!hasAnimated.current}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    filter="url(#barShadow)"
                    onAnimationEnd={() => {
                      hasAnimated.current = true;
                    }}
                    activeBar={{
                      fill: "url(#barGradientActive)",
                      filter: "url(#barShadow)",
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Income Structure - Modern Card Design */}
          <div className="bg-white p-8 rounded-[32px] shadow-premium border border-gray-100 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                  โครงสร้างรายได้
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">
                ฿
                {Math.ceil(
                  categorySales.reduce((sum, c) => sum + (c.revenue || 0), 0),
                ).toLocaleString()}
              </p>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex mb-8">
              {pieData.map((item, index) => (
                <div
                  key={index}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                  style={{
                    width: `${item.percentage || 0}%`,
                    backgroundColor: item.color,
                    minWidth: item.percentage > 0 ? "4px" : "0",
                  }}
                />
              ))}
            </div>

            {/* Category Cards */}
            <div className="flex-1 space-y-3">
              {pieData.map((item, index) => {
                const revenue = item.value || 0;
                return (
                  <div
                    key={index}
                    className="group relative p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: item.color }}
                        >
                          {(() => {
                            const name = (item.name || "").toLowerCase();
                            const iconProps = {
                              size: 16,
                              strokeWidth: 2.5,
                              color: "white",
                            };
                            if (name.includes("ขนม") || name.includes("snack"))
                              return <Cookie {...iconProps} />;
                            if (
                              name.includes("เครื่องดื่ม") ||
                              name.includes("drink") ||
                              name.includes("น้ำ")
                            )
                              return <Coffee {...iconProps} />;
                            if (
                              name.includes("อาหารแห้ง") ||
                              name.includes("dry")
                            )
                              return <Wheat {...iconProps} />;
                            if (
                              name.includes("ของใช้") ||
                              name.includes("ของชำ") ||
                              name.includes("household")
                            )
                              return <ShoppingBag {...iconProps} />;
                            if (
                              name.includes("แช่แข็ง") ||
                              name.includes("frozen")
                            )
                              return <Snowflake {...iconProps} />;
                            if (
                              name.includes("ผัก") ||
                              name.includes("ผลไม้") ||
                              name.includes("fresh")
                            )
                              return <Apple {...iconProps} />;
                            if (name.includes("นม") || name.includes("dairy"))
                              return <Milk {...iconProps} />;
                            if (name.includes("อื่น") || name.includes("other"))
                              return <MoreHorizontal {...iconProps} />;
                            return <Tag {...iconProps} />;
                          })()}
                        </div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-gray-900 tracking-tighter">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percentage || 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-inactive tracking-tight min-w-[60px] text-right">
                        ฿{Math.ceil(revenue).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
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
                            ${
                              rank === 1
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
                                e.target.src =
                                  "https://via.placeholder.com/150?text=No+Image";
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
                          ฿
                          {Math.ceil(
                            product.revenue || product.sold_qty * product.price,
                          ).toLocaleString()}
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
