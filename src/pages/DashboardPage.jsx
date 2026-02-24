import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Store,
  MoreVertical,
  BarChart3,
  LayoutDashboard,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";
import SystemNotificationModal from "../components/modals/SystemNotificationModal";
import ReceiptModal from "../components/ReceiptModal";
import { productService } from "../services/productService";
import { saleService } from "../services/saleService";
import { orderService } from "../services/orderService";
import { creditService } from "../services/creditService";
import { useBranch } from "../contexts/BranchContext";

const DashboardPage = () => {
  const { activeBranchId, activeBranchName } = useBranch();
  const scrollRef = React.useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalSold: 0,
  });
  const [bestSellers, setBestSellers] = React.useState([]);
  const [recentSales, setRecentSales] = React.useState([]);
  const [outstanding, setOutstanding] = React.useState({
    amount: 0,
    customerCount: 0,
    customers: [],
  });
  const [notificationData, setNotificationData] = React.useState({
    expired: [],
    expiringSoon: [],
    lowStock: [],
  });
  const [weeklyAnalytics, setWeeklyAnalytics] = React.useState({
    chartData: [],
    growth: 0,
    totalWeekRevenue: 0,
  });

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeBranchId) return;
      setIsLoading(true);
      console.log("Dashboard: Fetching data for branch:", activeBranchId);

      try {
        // Fetch data independently so one failure doesn't block others
        const fetchers = [
          {
            name: "Notifications",
            fn: () => productService.getDashboardNotifications(activeBranchId),
            setter: setNotificationData,
          },
          {
            name: "Metrics",
            fn: () => saleService.getDashboardMetrics(activeBranchId),
            setter: setMetrics,
          },
          {
            name: "Best Sellers",
            fn: () => saleService.getTopSellingProducts(activeBranchId),
            setter: setBestSellers,
          },
          {
            name: "Recent Orders",
            fn: () => orderService.getRecentOrders(activeBranchId),
            setter: setRecentSales,
          },
          {
            name: "Overdue Items",
            fn: () => creditService.getOverdueItems(activeBranchId),
            setter: (items) => {
              // Calculate outstanding balance and unique customers
              const totalOutstanding = items.reduce(
                (sum, item) => sum + (item.amount || 0),
                0,
              );
              const uniqueCustomers = [
                ...new Set(items.map((i) => i.customerId)),
              ];
              const customerAvatars = items
                .slice(0, 4)
                .map(
                  (i) =>
                    i.imageUrl ||
                    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${i.customerId}`,
                );

              setOutstanding({
                amount: totalOutstanding,
                customerCount: uniqueCustomers.length,
                customers: customerAvatars,
              });
            },
          },
          {
            name: "Weekly Analytics",
            fn: () => saleService.getWeeklyAnalytics(activeBranchId),
            setter: setWeeklyAnalytics,
          },
        ];

        await Promise.all(
          fetchers.map(async (f) => {
            try {
              const data = await f.fn();
              console.log(`Dashboard: ${f.name} loaded:`, data);
              f.setter(data);
            } catch (err) {
              console.error(`Dashboard: Failed to fetch ${f.name}:`, err);
            }
          }),
        );

        // Show notification modal once per session per branch
        const hasShownNotification = sessionStorage.getItem(
          `hasShownDashboardNotification_${activeBranchId}`,
        );
        if (!hasShownNotification) {
          setIsNotificationOpen(true);
          sessionStorage.setItem(
            `hasShownDashboardNotification_${activeBranchId}`,
            "true",
          );
        }
      } catch (globalError) {
        console.error("Dashboard: Unexpected global error:", globalError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeBranchId]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const getImageUrl = (path, bucket = "products") => {
    if (!path) return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http")) return cleanPath;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    let fullPath = cleanPath;
    if (!cleanPath.startsWith(`${bucket}/`)) {
      fullPath = `${bucket}/${cleanPath}`;
    }

    return `${supabaseUrl}/storage/v1/object/public/${fullPath}`;
  };

  const handleOrderClick = (sale) => {
    // Transform order data to match ReceiptModal's expected format
    const transaction = {
      receiptNo: sale.order_no,
      date: new Date(sale.created_at).toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      paymentMethod: sale.payment_method || "เงินสด",
      items:
        sale.order_items?.map((item) => ({
          name: item.products?.name || "N/A",
          quantity: item.qty || item.quantity || 1,
          price:
            (item.price_per_unit || item.price || 0) *
            (item.qty || item.quantity || 1),
        })) || [],
      total: sale.total_amount || 0,
      received: sale.amount_paid || sale.total_amount || 0,
      change: Math.max(
        0,
        (sale.amount_paid || sale.total_amount || 0) - (sale.total_amount || 0),
      ),
      store: {
        name: activeBranchName || "ZippyTill",
        address: "สาขา " + (activeBranchName || "Default"),
        phone: sale.customers_info?.phone || "-",
      },
    };
    setSelectedTransaction(transaction);
    setIsReceiptModalOpen(true);
  };

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
    <div className="relative flex flex-col xl:flex-row gap-8 pb-8 min-h-screen">
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <LayoutDashboard
                className="w-10 h-10 text-primary"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                ภาพรวม
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                ภาพรวมธุกิจของสาขาและข้อมูลสำคัญทั้งหมดในที่เดียว
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Sales Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Revenue Metric */}
          <div className="relative bg-gradient-to-br from-orange-50 via-white to-white rounded-[32px] p-8 border border-orange-100/50 shadow-elevation transition-all duration-500 group cursor-default hover:shadow-elevation-hover hover:-translate-y-2 overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-300/30 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100/10 rounded-full blur-2xl -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg border border-orange-400/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <FileText size={32} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border-2 bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm">
                  <TrendingUp size={14} strokeWidth={3} />{" "}
                  {weeklyAnalytics.growth > 0 ? "+" : ""}
                  {weeklyAnalytics.growth}%
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.15em]">
                  ยอดขายทั้งหมด
                </p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-primary transition-colors duration-300">
                  <span className="text-2xl font-bold opacity-50 mr-1">฿</span>
                  {metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Metric */}
          <div className="relative bg-gradient-to-br from-orange-50 via-white to-white rounded-[32px] p-8 border border-orange-100/50 shadow-elevation transition-all duration-500 group cursor-default hover:shadow-elevation-hover hover:-translate-y-2 overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-300/30 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100/10 rounded-full blur-2xl -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg border border-orange-400/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <ShoppingCart size={32} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border-2 bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm">
                  <TrendingUp size={14} strokeWidth={3} />{" "}
                  {weeklyAnalytics.growth > 0 ? "+" : ""}
                  {Math.round(weeklyAnalytics.growth * 0.8)}%
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.15em]">
                  ออเดอร์ทั้งหมด
                </p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-primary transition-colors duration-300">
                  {metrics.totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Sold Items Metric */}
          <div className="relative bg-gradient-to-br from-orange-50 via-white to-white rounded-[32px] p-8 border border-orange-100/50 shadow-elevation transition-all duration-500 group cursor-default hover:shadow-elevation-hover hover:-translate-y-2 overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-300/30 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100/10 rounded-full blur-2xl -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg border border-orange-400/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Package size={32} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border-2 bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm">
                  <TrendingUp size={14} strokeWidth={3} />{" "}
                  {weeklyAnalytics.growth > 0 ? "+" : ""}
                  {Math.round(weeklyAnalytics.growth * 0.1)}%
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.15em]">
                  สินค้าขายออก
                </p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-primary transition-colors duration-300">
                  {metrics.totalSold.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Sellers & Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best Sellers Section */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-elevation relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl text-primary border border-primary/10">
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  สินค้าขายดี
                </h3>
              </div>

              <div className="space-y-6">
                {bestSellers.length > 0 ? (
                  bestSellers.map((item, idx) => {
                    const rank = idx + 1;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 group/item cursor-pointer border-b border-gray-50 last:border-0 pb-4 last:pb-0"
                      >
                        {/* Rank Badge */}
                        <div
                          className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[13px] font-black shadow-sm transition-all duration-300
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

                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 transition-transform duration-500 group-hover/item:scale-110">
                          <img
                            src={
                              getImageUrl(item.image_url) ||
                              `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.name}`
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://api.dicebear.com/7.x/pixel-art/svg?seed=" +
                                item.name;
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-800 transition-colors tracking-tight truncate group-hover/item:text-primary">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-black text-primary tracking-tight">
                                ฿
                                {(
                                  item.revenue ||
                                  item.sold_qty * (item.price || 0)
                                ).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-[10px] font-black text-inactive uppercase tracking-widest opacity-60 shrink-0 ml-2">
                              {item.sold_qty} ชิ้น
                            </p>
                          </div>
                          <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100/50 shadow-inner relative">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${rank === 1
                                  ? "bg-amber-400"
                                  : rank === 2
                                    ? "bg-slate-400"
                                    : rank === 3
                                      ? "bg-orange-400"
                                      : "bg-primary"
                                }`}
                              style={{
                                width: `${Math.min(100, (item.sold_qty / (bestSellers[0].sold_qty || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-200">
                      <Package size={40} strokeWidth={1} />
                    </div>
                    <p className="text-xs font-bold text-inactive uppercase tracking-[0.2em]">
                      ไม่มีข้อมูลสินค้าขายดี
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sales Section */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-elevation relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100/30 transition-colors" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500 border border-emerald-100/50">
                    <ShoppingCart size={20} strokeWidth={2.5} />
                  </div>
                  รายการขายล่าสุด
                </h3>
              </div>

              <div className="overflow-hidden">
                {recentSales.length > 0 ? (
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <tbody>
                      {recentSales.slice(0, 5).map((sale, idx) => {
                        // Get first product image from order items
                        const firstProduct = sale.order_items?.[0]?.products;
                        const productImage = firstProduct?.image_url;
                        const customerName =
                          sale.customers_info?.name || "ลูกค้าทั่วไป";
                        const isRegularCustomer =
                          !sale.customers_info?.name ||
                          customerName === "ลูกค้าทั่วไป";

                        return (
                          <tr
                            key={idx}
                            className="group/row cursor-pointer"
                            onClick={() => handleOrderClick(sale)}
                          >
                            <td className="py-1">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 transition-transform duration-500 group-hover/row:scale-110">
                                <img
                                  src={
                                    isRegularCustomer
                                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${sale.order_no}&backgroundColor=f3f4f6`
                                      : productImage ||
                                      `https://api.dicebear.com/7.x/shapes/svg?seed=${sale.order_no}&backgroundColor=f3f4f6`
                                  }
                                  alt={
                                    isRegularCustomer
                                      ? "Customer Avatar"
                                      : "Product"
                                  }
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${sale.order_no}&backgroundColor=f3f4f6`;
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-1">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-900 group-hover/row:text-primary transition-colors">
                                  #{sale.order_no}
                                </span>
                                <span className="text-[10px] font-bold text-inactive uppercase tracking-widest opacity-60">
                                  {new Date(sale.created_at).toLocaleTimeString(
                                    "th-TH",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="py-1">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
                                  {sale.customers_info?.name || "ลูกค้าทั่วไป"}
                                </span>
                                <span className="text-[10px] font-medium text-inactive">
                                  {sale.payment_status || "เงินสด"}
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-right">
                              <span className="text-md font-black text-gray-900 tracking-tight">
                                <span className="text-[10px] opacity-40 mr-1 font-bold">
                                  ฿
                                </span>
                                {sale.total_amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-1 pl-4 text-right">
                              <div className="flex items-center justify-end">
                                <div
                                  className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${sale.payment_status === "completed"
                                      ? "bg-emerald-50 text-emerald-500"
                                      : sale.payment_status === "pending"
                                        ? "bg-amber-50 text-amber-500"
                                        : "bg-rose-50 text-rose-500"
                                    }`}
                                >
                                  {sale.payment_status === "completed" ? (
                                    <CheckCircle size={14} strokeWidth={2.5} />
                                  ) : (
                                    <Clock size={14} strokeWidth={2.5} />
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-200">
                      <FileText size={40} strokeWidth={1} />
                    </div>
                    <p className="text-xs font-bold text-inactive uppercase tracking-[0.2em]">
                      ไม่มีรายการขายล่าสุด
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Products Section - Beautified */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100/50 shadow-elevation relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-100/30 transition-colors" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-500 border border-rose-100/50">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                สินค้าใกล้หมดอายุ
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="h-8 w-8 bg-gray-50 rounded-lg text-inactive hover:text-primary hover:bg-primary/5 transition-all border border-gray-100 flex items-center justify-center"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="h-8 w-8 bg-gray-50 rounded-lg text-inactive hover:text-primary hover:bg-primary/5 transition-all border border-gray-100 flex items-center justify-center"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1"
            >
              {notificationData.expiringSoon.length > 0 ||
                notificationData.expired.length > 0 ? (
                [...notificationData.expired, ...notificationData.expiringSoon]
                  .sort((a, b) => a.days - b.days) // Sort by days remaining (ascending)
                  .map((prod, idx) => (
                    <div
                      key={idx}
                      className="flex-none w-[200px] bg-white rounded-2xl p-6 border border-gray-100/50 shadow-soft hover:shadow-elevation hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start flex flex-col items-center text-center group/item relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 h-1 w-full bg-rose-500/10 group-hover/item:bg-rose-500/20" />
                      <div className="relative mb-6 h-32 w-full flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50 overflow-hidden group-hover/item:scale-105 transition-transform duration-500">
                        <img
                          src={
                            prod.imageUrl ||
                            `https://api.dicebear.com/7.x/icons/svg?seed=${prod.name}&backgroundColor=ffd5dc`
                          }
                          alt={prod.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/icons/svg?seed=${prod.name}&backgroundColor=ffd5dc`;
                          }}
                        />
                      </div>
                      <h4 className="text-sm font-black text-gray-900 mb-3 truncate w-full tracking-tight">
                        {prod.name}
                      </h4>
                      <div className="flex flex-col items-center gap-2 mt-auto">
                        <p className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 uppercase tracking-tighter">
                          {prod.days} วันที่เหลือ
                        </p>
                        <p className="text-[10px] font-bold text-inactive uppercase tracking-widest opacity-60">
                          {prod.expiryDate}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-16 gap-4 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                  <div className="p-5 bg-white rounded-2xl shadow-sm text-emerald-400">
                    <CheckCircle size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-black text-inactive uppercase tracking-[0.3em]">
                    ไม่มีสินค้าใกล้หมดอายุ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Beautified */}
      <div className="xl:w-[320px] w-full space-y-8 shrink-0">
        {/* Branch Summary Section */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100/50 shadow-elevation text-center relative group/branch hover:shadow-elevation-hover hover:-translate-y-1 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -ml-12 -mt-12" />

          <div className="relative z-10">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-[28px] bg-gray-50 border border-gray-100 flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full rounded-[20px] bg-primary/10 flex items-center justify-center text-primary relative z-10 shadow-inner">
                  <Store size={40} strokeWidth={1.5} />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 h-7 px-3 bg-emerald-500 border-4 border-white rounded-xl flex items-center justify-center z-20 shadow-lg">
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                  Active
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 group-hover:text-primary transition-colors">
              {activeBranchName}
            </h2>
            <p className="text-[10px] font-black text-inactive mb-8 uppercase tracking-[0.2em] opacity-60">
              Current Active Store
            </p>

            <div className="grid grid-cols-2 gap-3 p-5 bg-gray-50/80 rounded-[28px] border border-gray-100 shadow-inner">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-inactive uppercase tracking-widest opacity-60 text-center">
                  Sales
                </p>
                <p className="text-xl font-black text-gray-900 tracking-tight">
                  <span className="text-xs opacity-30 mr-0.5 font-bold">฿</span>
                  {metrics.totalRevenue > 1000
                    ? Math.round(metrics.totalRevenue / 1000) + "k"
                    : metrics.totalRevenue}
                </p>
              </div>
              <div className="space-y-1 border-l border-gray-200/50">
                <p className="text-[9px] font-black text-inactive uppercase tracking-widest opacity-60 text-center">
                  Orders
                </p>
                <p className="text-xl font-black text-gray-900 tracking-tight">
                  {metrics.totalOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card - Swiss Modern Redesign */}
        <div className="relative bg-[#ED7117] rounded-[32px] p-6 shadow-elevation group/balance transition-all duration-500 overflow-hidden hover:shadow-elevation-hover hover:-translate-y-1">
          {/* Subtle Accent Background Element */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

          <div className="relative z-20">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] pl-0.5">
                  Outstanding
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white tracking-tighter">
                    <span className="text-xl opacity-40 mr-1 font-bold">฿</span>
                    {outstanding.amount.toLocaleString()}
                  </p>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex flex-col gap-2.5">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.1em]">
                  {outstanding.customerCount} Active Customers
                </p>
                <div className="flex -space-x-2.5">
                  {outstanding.customers.map((url, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-4 border-[#ED7117] bg-white ring-2 ring-white/10 overflow-hidden shadow-lg hover:z-10 hover:scale-110 transition-transform"
                    >
                      <img
                        src={url}
                        alt="customer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {outstanding.customerCount > 4 && (
                    <div className="w-9 h-9 rounded-full border-4 border-[#ED7117] bg-white/20 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white/10 backdrop-blur-md">
                      +{outstanding.customerCount - 4}
                    </div>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-[#ED7117] shadow-xl hover:shadow-2xl active:scale-90 transition-all cursor-pointer">
                <TrendingUp size={22} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Targeted Analytics - Ultra Compact */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100/50 shadow-elevation relative group/analytics hover:shadow-elevation-hover hover:-translate-y-1 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-3xl -mr-12 -mt-12" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-xl text-primary border border-gray-100 shadow-sm">
                  <BarChart3 size={20} strokeWidth={2.5} />
                </div>
                Analytics
              </h3>
            </div>

            <div className="flex items-end justify-between gap-3 h-28 px-1 mb-6">
              {weeklyAnalytics.chartData.length > 0
                ? weeklyAnalytics.chartData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center flex-1 group/bar relative h-full justify-end"
                  >
                    <div className="w-full flex justify-center relative items-end h-[80px] mb-2">
                      <div className="w-2.5 bg-gray-50 rounded-full h-full absolute bottom-0 shadow-inner"></div>
                      <div
                        className="w-2.5 bg-primary rounded-full absolute bottom-0 transition-all duration-1000 ease-out shadow-md group-hover/bar:bg-primary/80"
                        style={{
                          height: `${Math.min(100, (item.value / (Math.max(...weeklyAnalytics.chartData.map((d) => d.value)) || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-inactive group-hover/bar:text-primary tracking-[0.1em] transition-colors duration-300">
                      {item.day}
                    </span>
                  </div>
                ))
                : [1, 2, 3, 4, 5, 6, 7].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <div className="w-2.5 bg-gray-50 rounded-full h-12 mb-2 animate-pulse" />
                    <div className="h-2 w-4 bg-gray-50 rounded animate-pulse" />
                  </div>
                ))}
            </div>

            <div className="p-5 bg-gray-50/80 rounded-[28px] border border-gray-100 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-black text-inactive uppercase tracking-[0.1em] opacity-60">
                    Overall Growth
                  </p>
                  <p className="text-xl font-black text-emerald-500 tracking-tighter">
                    {weeklyAnalytics.growth > 0 ? "+" : ""}
                    {weeklyAnalytics.growth}%
                  </p>
                </div>
                <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:rotate-12 transition-transform duration-500">
                  <TrendingUp size={18} strokeWidth={3} />
                </div>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-gray-100 shadow-inner p-0.5">
                <div className="bg-emerald-500 h-full w-[65%] rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SystemNotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        data={notificationData}
      />

      <ReceiptModal
        visible={isReceiptModalOpen}
        transaction={selectedTransaction}
        onClose={() => setIsReceiptModalOpen(false)}
        onPrint={() => {
          window.print();
          setIsReceiptModalOpen(false);
        }}
        onNewTransaction={() => {
          setIsReceiptModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardPage;
