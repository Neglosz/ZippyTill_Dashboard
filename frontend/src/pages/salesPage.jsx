import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  BarChart3,
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
  RotateCcw,
  ShoppingBasket,
  Tag,
} from "lucide-react";
import { saleService } from "../services/saleService";
import { useBranch } from "../contexts/BranchContext";
import { PageHeader, PageBackground } from "../components/common/PageHeader";
import { StatsCard } from "../components/common/StatsCard";
import { supabase } from "../lib/supabase";
import SalesHistoryChart from "../components/sales/SalesHistoryChart";

// --- Sub-components for better readability ---

/**
 * Category Icon mapping based on category name
 */
const CategoryIcon = ({ name, color }) => {
  const iconProps = { size: 16, strokeWidth: 2.5, color: "white" };
  const normalizedName = (name || "").toLowerCase();

  const getIcon = () => {
    if (normalizedName.includes("ขนม") || normalizedName.includes("snack")) return <Cookie {...iconProps} />;
    if (normalizedName.includes("เครื่องดื่ม") || normalizedName.includes("drink") || normalizedName.includes("น้ำ")) return <Coffee {...iconProps} />;
    if (normalizedName.includes("อาหารแห้ง") || normalizedName.includes("dry")) return <Wheat {...iconProps} />;
    if (normalizedName.includes("ของใช้") || normalizedName.includes("ของชำ") || normalizedName.includes("household")) return <ShoppingBag {...iconProps} />;
    if (normalizedName.includes("แช่แข็ง") || normalizedName.includes("frozen")) return <Snowflake {...iconProps} />;
    if (normalizedName.includes("ผัก") || normalizedName.includes("ผลไม้") || normalizedName.includes("fresh")) return <Apple {...iconProps} />;
    if (normalizedName.includes("นม") || normalizedName.includes("dairy")) return <Milk {...iconProps} />;
    if (normalizedName.includes("อื่น") || normalizedName.includes("other")) return <MoreHorizontal {...iconProps} />;
    return <Tag {...iconProps} />;
  };

  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
      style={{ backgroundColor: color }}
    >
      {getIcon()}
    </div>
  );
};

/**
 * Rank badge for top products
 */
const RankBadge = ({ rank }) => {
  const getStyles = () => {
    switch (rank) {
      case 1: return "bg-amber-400 text-white shadow-amber-200";
      case 2: return "bg-slate-400 text-white shadow-slate-200";
      case 3: return "bg-orange-400 text-white shadow-orange-200";
      default: return "bg-gray-100 text-inactive border border-gray-100";
    }
  };

  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm ${getStyles()}`}>
      {rank}
    </div>
  );
};

/**
 * Trend indicator for top products
 */
const TrendIndicator = ({ trend = "STABLE" }) => {
  const normalizedTrend = trend.toUpperCase();
  let styles = "bg-gray-50 text-inactive border-gray-100";
  let Icon = TrendingUp;
  let label = "คงที่";

  if (normalizedTrend === "UP") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-100";
    Icon = TrendingUp;
    label = "เพิ่มขึ้น";
  } else if (normalizedTrend === "DOWN") {
    styles = "bg-rose-50 text-rose-600 border-rose-100";
    Icon = TrendingDown;
    label = "ลดลง";
  }

  return (
    <div className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex border ${styles}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};

// --- Main Page Component ---

const SalesPage = () => {
  const { activeBranchId } = useBranch();
  const [timeRange, setTimeRange] = useState("1D");
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  const isInitialLoad = useRef(true);
  const prevTimeRange = useRef(timeRange);

  const colors = useMemo(() => [
    "#F43F5E", // rose-500
    "#F59E0B", // amber-500
    "#10B981", // emerald-500
    "#3B82F6", // blue-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
  ], []);

  /**
   * Main data fetching function
   */
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!activeBranchId) return;

      const isTimeRangeChange = !isInitialLoad.current && prevTimeRange.current !== timeRange;
      prevTimeRange.current = timeRange;

      try {
        if (isInitialLoad.current) {
          setIsLoading(true);
        } else if (isBackground) {
          setIsRefreshing(true);
        }

        if (isTimeRangeChange && !isBackground) {
          // If only time range changed, only fetch history
          setIsChartLoading(true);
          const histData = await saleService.getSalesHistory(activeBranchId, timeRange);
          setHistoryData(histData || []);
        } else {
          // Full fetch for initial load or manual refresh
          const [topData, catData, metricsData, histData] = await Promise.all([
            saleService.getTopSellingProducts(activeBranchId),
            saleService.getSalesByCategory(activeBranchId),
            saleService.getDashboardMetrics(activeBranchId),
            saleService.getSalesHistory(activeBranchId, timeRange),
          ]);

          setTopProducts(topData || []);
          setHistoryData(histData || []);
          setSalesSummary(metricsData || { totalRevenue: 0, todayRevenue: 0, totalSold: 0, totalProducts: 0 });

          // Process category sales for the pie chart and list
          const totalRevenue = parseFloat(metricsData?.totalRevenue) || 0;
          const processedCatData = (catData || [])
            .filter((c) => c.revenue > 0)
            .map((c, index) => ({
              ...c,
              percentage: totalRevenue > 0 ? ((c.revenue / totalRevenue) * 100).toFixed(0) : 0,
              color: colors[index % colors.length],
              value: c.revenue,
            }));

          setCategorySales(processedCatData);
        }
        setFetchError(null);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (isInitialLoad.current) setFetchError("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsChartLoading(false);
        isInitialLoad.current = false;
      }
    },
    [activeBranchId, timeRange, colors],
  );

  // Initial and range-change fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates and Polling
  useEffect(() => {
    if (!activeBranchId) return;

    // 1. Supabase Real-time subscription
    const ordersChannel = supabase
      .channel(`sales_orders_${activeBranchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `store_id=eq.${activeBranchId}` },
        () => fetchData(true)
      )
      .subscribe();

    // 2. Polling fallback every minute
    const intervalId = setInterval(() => fetchData(true), 60000);

    return () => {
      if (ordersChannel) supabase.removeChannel(ordersChannel);
      clearInterval(intervalId);
    };
  }, [fetchData, activeBranchId]);

  const stats = useMemo(() => [
    {
      id: 1,
      title: "ยอดขายรวม",
      amount: (
        <>
          <span className="text-2xl opacity-50 mr-1 tracking-normal font-bold">฿</span>
          {Math.ceil(salesSummary.totalRevenue || 0).toLocaleString()}
        </>
      ),
      color: "bg-rose-50",
      iconBg: "bg-rose-500",
      icon: BarChart3,
    },
    {
      id: 0,
      title: "ยอดขายวันนี้",
      amount: (
        <>
          <span className="text-2xl opacity-50 mr-1 tracking-normal font-bold">฿</span>
          {Math.ceil(salesSummary.todayRevenue || 0).toLocaleString()}
        </>
      ),
      color: "bg-orange-50",
      iconBg: "bg-orange-500",
      icon: TrendingUp,
    },
    {
      id: 3,
      title: "จำนวนสินค้าที่ขายไป",
      amount: Math.ceil(salesSummary.totalSold || 0).toLocaleString(),
      color: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      icon: Tag,
    },
  ], [salesSummary]);

  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    return historyData.map((item) => ({
      ...item,
      displayName: item.fullDate || item.name,
    }));
  }, [historyData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-base font-bold text-primary uppercase tracking-[0.2em] animate-pulse">กำลังโหลดข้อมูล</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBackground />

      <div className="flex flex-col gap-4 pb-10">
        <PageHeader
          title="ยอดขาย"
          description="สรุปภาพรวมยอดขายและสถิติสินค้าที่สำคัญ"
          icon={ShoppingCart}
        >
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/20 active:scale-95 group ${isRefreshing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <RotateCcw className={`w-4 h-4 text-primary ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">
              {isRefreshing ? "กำลังอัปเดต..." : "อัปเดตข้อมูล"}
            </span>
          </button>
        </PageHeader>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {stats.map((topic) => (
            <StatsCard key={topic.id} {...topic} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart: Sales History */}
          <div className="xl:col-span-2 bg-white p-5 md:p-8 rounded-[32px] shadow-premium border border-gray-100 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">สถิติยอดขาย</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                  <span className="text-xl md:text-2xl opacity-50 mr-1 tracking-normal font-bold">฿</span>
                  {Math.ceil(salesSummary.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1.5 w-full sm:w-auto overflow-x-auto">
                {["1D", "1W", "1M", "1Y"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex-1 sm:flex-none px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${timeRange === range ? "bg-white shadow-sm text-primary border border-gray-100" : "text-inactive hover:text-gray-900"}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <SalesHistoryChart data={chartData} timeRange={timeRange} isLoading={isChartLoading || isRefreshing} />
          </div>

          {/* Income Structure (Category Breakdown) */}
          <div className="bg-white p-5 md:p-8 rounded-[32px] shadow-premium border border-gray-100 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">โครงสร้างรายได้</span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                <span className="text-xl md:text-2xl opacity-50 mr-1 tracking-normal font-bold">฿</span>
                {Math.ceil(salesSummary.totalRevenue || 0).toLocaleString()}
              </p>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex mb-8">
              {categorySales.map((item, index) => (
                <div
                  key={index}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                  style={{ width: `${item.percentage || 0}%`, backgroundColor: item.color, minWidth: item.percentage > 0 ? "4px" : "0" }}
                />
              ))}
            </div>

            {/* Category List */}
            <div className="space-y-3 relative overflow-y-auto pr-1" style={{ maxHeight: "300px", scrollbarWidth: "thin", scrollbarColor: "#E2E8F0 transparent" }}>
              {isRefreshing && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px] rounded-2xl">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {categorySales.map((item, index) => (
                <div key={index} className="group relative p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={item.name} color={item.color} />
                      <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900 tracking-tighter">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage || 0}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="text-[10px] font-bold text-inactive tracking-tight min-w-[60px] text-right">
                      ฿{Math.ceil(item.value || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best Sellers Table */}
        <div className="bg-white p-5 md:p-8 rounded-[32px] shadow-premium border border-gray-100 relative">
          {isRefreshing && (
            <div className="absolute top-8 right-8 z-10">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">สินค้าขายดี Top 5</h2>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-inactive text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-6 pl-4 w-20">อันดับ</th>
                  <th className="pb-6 pl-4 w-24">รูปสินค้า</th>
                  <th className="pb-6">ชื่อสินค้า</th>
                  <th className="pb-6 w-32 text-center">ยอดขาย</th>
                  <th className="pb-6 w-32 text-right">รายได้</th>
                  <th className="pb-6 w-32 text-right">แนวโน้ม</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!topProducts || topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-inactive font-bold">ไม่พบข้อมูลรายการสินค้า</td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all group">
                      <td className="py-6 pl-4 font-black">
                        <RankBadge rank={index + 1} />
                      </td>
                      <td className="py-6 pl-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform duration-500 group-hover:scale-110 flex items-center justify-center bg-gray-50">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentNode.querySelector(".placeholder-icon").classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div className={`placeholder-icon ${product.image_url ? "hidden" : "flex"} items-center justify-center w-full h-full`}>
                            <ShoppingBasket className="w-8 h-8 text-gray-200" strokeWidth={1.5} />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-gray-900 font-black tracking-tight">{product.name}</td>
                      <td className="py-6 text-inactive font-bold text-center">{product.sold_qty} ชิ้น</td>
                      <td className="py-6 text-gray-900 font-black tracking-tight text-right pr-4">
                        ฿{Math.ceil(product.revenue || product.sold_qty * product.price).toLocaleString()}
                      </td>
                      <td className="py-6 text-right pr-4">
                        <TrendIndicator trend={product.trend} />
                      </td>
                    </tr>
                  ))
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
