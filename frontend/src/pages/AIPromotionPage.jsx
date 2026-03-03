import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
  Zap,
  ArrowRight,
  MoreHorizontal,
  Plus,
  RotateCw,
  Target,
  BarChart3,
  Calendar,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CreatePromotionModal from "../components/features/ai/CreatePromotionModal";
import PromotionDetailModal from "../components/features/ai/PromotionDetailModal";
import { useBranch } from "../contexts/BranchContext";
import { aiService } from "../services/aiService";
import { promotionService } from "../services/promotionService";
import { supabase } from "../lib/supabase";
import { PageHeader, PageBackground } from "../components/common/PageHeader";

const AIPromotionPage = () => {
  const { activeBranchId, activeBranchName } = useBranch();

  // Cache utilities for AI recommendations
  const CACHE_KEY = "ai_promo_recommendations";
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  const getCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp, branchId } = JSON.parse(cached);
      // Invalidate if different branch or expired
      if (branchId !== activeBranchId) return null;
      if (Date.now() - timestamp > CACHE_DURATION) return null;
      return data;
    } catch (error) {
      console.error("Cache read error:", error);
      return null;
    }
  }, [activeBranchId]);

  const setCache = useCallback(
    (data) => {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
            branchId: activeBranchId,
          }),
        );
      } catch (error) {
        console.error("Cache write error:", error);
      }
    },
    [activeBranchId],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecLoading, setIsRecLoading] = useState(true);
  const [activePromotions, setActivePromotions] = useState([]);
  const [isPromosLoading, setIsPromosLoading] = useState(true);
  const [aiPromoData, setAiPromoData] = useState(null);
  const [usedRecId, setUsedRecId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [, setTick] = useState(0); // triggers re-render every second

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateFromAI = useCallback((rec) => {
    // Transform AI recommendation into modal-compatible format
    const transformedData = {
      title: rec.title,
      desc: rec.desc,
      target_products: rec.target_products || [],
      promotion_type: rec.promotion_type || "discount_percent",
      discount_value: rec.discount_value || 10,
      min_spend: rec.min_spend || 0,
      min_qty_required: rec.min_qty_required || 2,
      free_qty: rec.free_qty || 1,
    };
    setUsedRecId(rec.id); // Track which recommendation is being used
    setAiPromoData(transformedData);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setAiPromoData(null);
  }, []);

  const getIcon = useCallback((iconName) => {
    switch (iconName) {
      case "TrendingUp":
        return TrendingUp;
      case "Package":
        return Package;
      case "Users":
        return Users;
      default:
        return Sparkles;
    }
  }, []);

  // Calculate real stats from active promotions
  const stats = useMemo(() => {
    const activePromosCount = activePromotions.filter(
      (p) => p.is_active,
    ).length;
    const totalSales = activePromotions.reduce(
      (sum, p) => sum + (p.total_sales || 0),
      0,
    );
    const totalCustomers = activePromotions.reduce(
      (sum, p) => sum + (p.customer_count || 0),
      0,
    );

    return [
      {
        id: 1,
        label: "โปรโมชั่นที่ใช้งานอยู่",
        value: `${activePromosCount} รายการ`,
        trend: activePromosCount > 0 ? "+33%" : "0%",
        icon: Zap,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
      },
      {
        id: 2,
        label: "ยอดขายจากโปรโมชั่น",
        value: totalSales > 0 ? `฿${totalSales.toLocaleString()}` : "฿0",
        trend: totalSales > 0 ? "+28%" : "0%",
        icon: TrendingUp,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      },
      {
        id: 3,
        label: "ลูกค้าที่ใช้โปรโมชั่น",
        value:
          totalCustomers > 0 ? `${totalCustomers.toLocaleString()} คน` : "0 คน",
        trend: totalCustomers > 0 ? "+42%" : "0%",
        icon: Users,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      },
      {
        id: 4,
        label: "คำแนะนำจาก AI",
        value: `${recommendations.length} รายการ`,
        isAi: true,
        icon: Sparkles,
        color: "text-orange-600",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      },
    ];
  }, [activePromotions, recommendations.length]);

  const fetchRecs = useCallback(
    async (forceRefresh = false) => {
      if (!activeBranchId) return;

      // Try to load from cache first if not forcing refresh
      const cachedData = forceRefresh ? null : getCache();
      if (cachedData) {
        console.log("📦 Loading recommendations from cache");
        setRecommendations(cachedData);
        setIsRecLoading(false); // Show cached data immediately
        return; // Stop here and don't fetch fresh data if cache is valid
      } else {
        setRecommendations([]); // Clear old state for new branch or refresh
        setIsRecLoading(true);
      }

      // Fetch fresh data
      try {
        console.log(
          forceRefresh
            ? "🔄 Forcing fresh AI recommendations..."
            : "🔄 Fetching fresh AI recommendations...",
        );
        const aiRecs = await aiService.getPromotionRecommendations(
          activeBranchId,
          activeBranchName,
        );
        setRecommendations(aiRecs);
        setCache(aiRecs); // Update cache
        console.log("✅ Fresh recommendations loaded and cached");
      } catch (error) {
        console.error("Failed to fetch AI recs:", error);
        // Only show fallback if no cache available and not forcing refresh
        if (!cachedData) {
          setRecommendations([
            {
              id: 1,
              title: "โปรโมชั่นสินค้าขายดี",
              desc: "ลด 15% สำหรับสินค้า Top 5 เพื่อเพิ่มยอดขาย",
              match: "92%",
              benefit: "+25% ยอดขาย",
              icon: "TrendingUp",
              color: "text-purple-500",
              bg: "bg-purple-50",
            },
            {
              id: 2,
              title: "ซื้อ 2 แถม 1",
              desc: "สินค้าที่สต็อกเยอะ - เพิ่มการหมุนเวียน",
              match: "88%",
              benefit: "+40% ยอดขาย",
              icon: "Package",
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
          ]);
        }
      } finally {
        setIsRecLoading(false);
      }
    },
    [activeBranchId, activeBranchName, getCache, setCache],
  );

  useEffect(() => {
    fetchRecs(false);
  }, [fetchRecs]);

  const handleRefreshRecs = useCallback(() => {
    fetchRecs(true);
  }, [fetchRecs]);

  const fetchPromos = useCallback(async () => {
    if (!activeBranchId) return;
    try {
      setActivePromotions([]); // Clear old state
      setIsPromosLoading(true);
      const data = await promotionService.getPromotions(activeBranchId);
      setActivePromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setIsPromosLoading(false);
    }
  }, [activeBranchId]);

  // Fetch chart data: split by order_items.promotion_id (null = no promo, not null = with promo)
  const fetchChartData = useCallback(async () => {
    if (!activeBranchId) return;
    try {
      setIsChartLoading(true);
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1).toISOString();

      // Fetch order_items joined with orders (filter by store + year)
      // promotion_id != null → sold with a promotion
      const { data: items, error } = await supabase
        .from("order_items")
        .select(
          `
          subtotal,
          promotion_id,
          orders!inner ( created_at, store_id )
        `,
        )
        .eq("orders.store_id", activeBranchId)
        .gte("orders.created_at", startOfYear);
      if (error) throw error;

      // Build monthly buckets (last 6 months)
      const thaiMonths = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: d.getMonth(),
          year: d.getFullYear(),
          name: thaiMonths[d.getMonth()],
          withPromo: 0,
          noPromo: 0,
        });
      }

      // Bucket each order_item by month
      (items || []).forEach((item) => {
        const createdAt = item.orders?.created_at;
        if (!createdAt) return;
        const d = new Date(createdAt);
        const bucket = months.find(
          (m) => m.month === d.getMonth() && m.year === d.getFullYear(),
        );
        if (!bucket) return;
        const amount = parseFloat(item.subtotal) || 0;
        if (item.promotion_id) {
          bucket.withPromo += amount;
        } else {
          bucket.noPromo += amount;
        }
      });

      setChartData(months);
    } catch (err) {
      console.error("fetchChartData error:", err);
    } finally {
      setIsChartLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    fetchPromos();
    fetchChartData();
  }, [fetchPromos, fetchChartData]);

  const handlePromotionCreated = useCallback(() => {
    // Remove the used recommendation from the list
    if (usedRecId !== null) {
      setRecommendations((prev) => prev.filter((r) => r.id !== usedRecId));
      setUsedRecId(null);
    }
    fetchPromos();
    fetchChartData();
    setIsModalOpen(false);
  }, [usedRecId, fetchPromos, fetchChartData]);

  const getPromotionLabel = useCallback((promo) => {
    switch (promo.type) {
      case "discount_percent":
        return `ลด ${promo.discount_value}%`;
      case "discount_amount":
        return `ลด ฿${promo.discount_value}`;
      case "buy_x_get_y":
        return `ซื้อ ${promo.min_qty_required} แถม ${promo.free_qty}`;
      case "bundle":
        return "ราคาพิเศษยกชุด";
      default:
        return "ส่วนลดพิเศษ";
    }
  }, []);

  // Parse date string as LOCAL time to avoid UTC +7 offset issues
  // new Date("2026-02-24") → UTC midnight → 07:00 Thailand → loses 7 hours
  const parseLocalDate = useCallback((dateStr, isEndDate = false) => {
    if (!dateStr) return null;
    // If it's a date-only string YYYY-MM-DD, parse as local time
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      // end_date = 23:59:59 local (so it covers the full day)
      // start_date = 00:00:00 local
      return isEndDate
        ? new Date(year, month - 1, day, 23, 59, 59)
        : new Date(year, month - 1, day, 0, 0, 0);
    }
    return new Date(dateStr);
  }, []);

  const formatDateRange = useCallback(
    (start, end) => {
      if (!start && !end) return "ไม่มีกำหนด";
      const s = start
        ? parseLocalDate(start).toLocaleDateString("th-TH")
        : "...";
      const e = end
        ? parseLocalDate(end, true).toLocaleDateString("th-TH")
        : "ไม่มีกำหนด";
      return `${s} - ${e}`;
    },
    [parseLocalDate],
  );

  const getStatusInfo = useCallback(
    (isActive, endDate) => {
      if (!isActive) return { label: "ปิดใช้งาน", color: "bg-gray-400" };
      if (parseLocalDate(endDate, true) < new Date())
        return { label: "หมดอายุ", color: "bg-red-500" };
      return { label: "ใช้งาน", color: "bg-emerald-500" };
    },
    [parseLocalDate],
  );

  const getTimeRemaining = useCallback(
    (createdAt, endDate) => {
      const now = new Date();
      const start = createdAt ? new Date(createdAt) : now;
      const end = parseLocalDate(endDate, true);
      if (!end)
        return {
          text: "ไม่มีกำหนด",
          percentage: 0,
          color: "from-emerald-500 to-emerald-600",
        };
      const total = end - start;
      const remaining = end - now;

      if (remaining <= 0) {
        return {
          text: "หมดเวลา",
          percentage: 100,
          color: "from-red-500 to-red-600",
        };
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      // Calculate percentage based on actual duration
      const elapsed = now - start;
      const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));

      // Determine color based on urgency (remaining percentage)
      const remainingPercentage = 100 - percentage;
      let color;
      if (remainingPercentage > 50) {
        color = "from-emerald-500 to-emerald-600"; // Green
      } else if (remainingPercentage > 20) {
        color = "from-yellow-500 to-yellow-600"; // Yellow
      } else {
        color = "from-red-500 to-red-600"; // Red
      }

      // Format text
      let text;
      if (days > 0) {
        text = `${days} วัน ${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
      } else if (hours > 0) {
        text = `${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
      } else if (minutes > 0) {
        text = `${minutes} นาที ${seconds} วินาที`;
      } else {
        text = `${seconds} วินาที`;
      }

      return { text, percentage, color };
    },
    [parseLocalDate],
  );

  return (
    <>
      <PageBackground />

      <div className="relative pb-10 space-y-6 min-h-screen font-sans">
        <PageHeader
          title="AI โปรโมชั่น"
          description="ใช้ AI ของสาขาช่วยวิเคราะห์และสร้างโปรโมชั่นที่เหมาะสมที่สุด"
          icon={Sparkles}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            <Plus size={20} strokeWidth={3} />
            <span>สร้างด้วย AI</span>
          </button>
        </PageHeader>

        <CreatePromotionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialData={aiPromoData}
          onPromotionCreated={handlePromotionCreated}
        />

        <PromotionDetailModal
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
          onDeleteSuccess={() => {
            fetchPromos();
            fetchChartData();
          }}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-[28px] p-6 shadow-premium border border-gray-100 hover:shadow-premium-hover transition-all duration-300 group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.border} border`}
                >
                  <stat.icon
                    className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`}
                  />
                </div>
                {stat.isAi ? (
                  <div className="bg-gradient-to-br from-primary to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                    AI
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-100">
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-inactive text-xs font-bold uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column (AI Assistant & Recs) */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            {/* AI Recommendations List */}
            <div className="bg-white rounded-[32px] p-6 shadow-premium border border-gray-100 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-orange-500 w-5 h-5" />
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    คำแนะนำจาก AI
                  </h3>
                </div>
                <button
                  onClick={handleRefreshRecs}
                  disabled={isRecLoading}
                  className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isRecLoading
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-inactive hover:text-primary hover:bg-primary/10 hover:rotate-180"
                    }`}
                  title="โหลดคำแนะนำใหม่"
                >
                  <RotateCw
                    size={18}
                    className={isRecLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
              <div className="space-y-4 flex-1">
                {isRecLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                    <Sparkles className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-inactive">
                      กำลังวิเคราะห์ข้อมูล...
                    </p>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-10 opacity-60">
                    <Sparkles className="w-8 h-8 text-inactive" />
                    <p className="text-sm font-bold text-inactive text-center px-4">
                      ไม่มีข้อมูลเพียงพอสำหรับสร้างโปรโมชั่นในขณะนี้
                      <br />
                      <span className="text-[10px] font-medium">
                        (ลองเพิ่มสินค้าหรือขายสินค้าก่อนนะคะ)
                      </span>
                    </p>
                  </div>
                ) : (
                  recommendations.map((rec) => {
                    const IconComponent = getIcon(rec.icon);
                    return (
                      <div
                        key={rec.id}
                        className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center ${rec.bg} ${rec.color}`}
                            >
                              <IconComponent size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">
                                {rec.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {rec.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-3 text-[10px] font-bold">
                            <span className="text-inactive">
                              Match{" "}
                              <span className="text-gray-900">{rec.match}</span>
                            </span>
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {rec.benefit}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCreateFromAI(rec)}
                            className="w-[80px] py-2 bg-primary text-white text-[10px] font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-sm shadow-primary/20"
                          >
                            สร้างเลย
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Active Promo & Chart) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Active Promotions List */}
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  โปรโมชั่นที่ใช้งานอยู่
                </h3>
                <button
                  onClick={() => setIsViewAllOpen(true)}
                  className="text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors"
                >
                  ดูทั้งหมด
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isPromosLoading ? (
                  <div className="col-span-2 py-10 flex justify-center">
                    <MoreHorizontal className="animate-bounce text-inactive" />
                  </div>
                ) : activePromotions.length === 0 ? (
                  <div className="col-span-2 py-10 text-center text-inactive font-bold">
                    ยังไม่มีโปรโมชั่นที่ใช้งานอยู่
                  </div>
                ) : (
                  activePromotions.slice(0, 4).map((promo) => {
                    const status = getStatusInfo(
                      promo.is_active,
                      promo.end_date,
                    );
                    return (
                      <div
                        key={promo.id}
                        onClick={() => setSelectedPromo(promo)}
                        className="bg-gray-50 p-4 rounded-[24px] border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
                              {promo.name}
                            </h4>
                            <p className="text-[9px] font-bold text-inactive uppercase tracking-wider">
                              ID: {promo.id.slice(0, 8)}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-lg text-white ${status.color} shrink-0 ml-2`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 mb-4">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                              <Target size={12} className="text-primary" />
                            </div>
                            <span className="truncate">
                              {getPromotionLabel(promo)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                              <Calendar size={12} className="text-blue-500" />
                            </div>
                            <span className="truncate">
                              {formatDateRange(
                                promo.start_date,
                                promo.end_date,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                              <Package size={12} className="text-emerald-500" />
                            </div>
                            <span>{promo.itemCount} สินค้า</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-gray-200/50">
                          {(() => {
                            const timeRemaining = getTimeRemaining(
                              promo.created_at,
                              promo.end_date,
                            );
                            return (
                              <>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                                  <span className="text-inactive">
                                    เวลาที่เหลือ
                                  </span>
                                  <span className="text-gray-900">
                                    {timeRemaining.text}
                                  </span>
                                </div>
                                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${timeRemaining.color} rounded-full transition-all duration-1000 ease-out`}
                                    style={{
                                      width: `${100 - timeRemaining.percentage}%`,
                                    }}
                                  />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Results Comparison Chart */}
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">
                    ผลลัพธ์โปรโมชั่น
                  </h3>
                  <p className="text-xs font-medium text-inactive">
                    เปรียบเทียบยอดขายระหว่างมีโปรโมชั่นกับไม่มีโปรโมชั่น
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-gray-600">
                      มีโปรโมชั่น
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-xs font-bold text-gray-600">
                      ไม่มีโปรโมชั่น
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                {isChartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs font-bold text-inactive uppercase tracking-widest animate-pulse">
                        กำลังโหลดข้อมูล...
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barGap={8}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#9CA3AF",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#9CA3AF",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                          fontFamily: "inherit",
                        }}
                        formatter={(value) => [
                          `฿${value.toLocaleString()}`,
                          "",
                        ]}
                      />

                      <Bar
                        dataKey="withPromo"
                        name="มีโปรโมชั่น"
                        fill="#ED7117"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="noPromo"
                        name="ไม่มีโปรโมชั่น"
                        fill="#9CA3AF"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View All Promotions Modal */}
      {isViewAllOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsViewAllOpen(false)}
          />
          <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
                  โปรโมชั่นทั้งหมด
                  <span className="text-primary">.</span>
                </h2>
                <p className="text-xs font-medium text-inactive">
                  รายการโปรโมชั่นทั้งหมดที่กำลังใช้งานและเคยสร้างไว้
                </p>
              </div>
              <button
                onClick={() => setIsViewAllOpen(false)}
                className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-inactive hover:text-primary hover:bg-primary/5 transition-all border border-gray-100 shadow-sm"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Modal Content - Scrollable Grid */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePromotions.map((promo) => {
                  const status = getStatusInfo(promo.is_active, promo.end_date);
                  return (
                    <div
                      key={promo.id}
                      onClick={() => {
                        setSelectedPromo(promo);
                        setIsViewAllOpen(false);
                      }}
                      className="bg-gray-50 p-4 rounded-[24px] border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
                            {promo.name}
                          </h4>
                          <p className="text-[9px] font-bold text-inactive uppercase tracking-wider">
                            ID: {promo.id.slice(0, 8)}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-lg text-white ${status.color} shrink-0 ml-2`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 mb-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <Target size={12} className="text-primary" />
                          </div>
                          <span className="truncate">
                            {getPromotionLabel(promo)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <Calendar size={12} className="text-blue-500" />
                          </div>
                          <span className="truncate">
                            {formatDateRange(promo.start_date, promo.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <Package size={12} className="text-emerald-500" />
                          </div>
                          <span>{promo.itemCount} สินค้า</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-gray-200/50">
                        {(() => {
                          const timeRemaining = getTimeRemaining(
                            promo.created_at,
                            promo.end_date,
                          );
                          return (
                            <>
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                                <span className="text-inactive">
                                  เวลาที่เหลือ
                                </span>
                                <span className="text-gray-900">
                                  {timeRemaining.text}
                                </span>
                              </div>
                              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${timeRemaining.color} rounded-full transition-all duration-1000 ease-out`}
                                  style={{
                                    width: `${100 - timeRemaining.percentage}%`,
                                  }}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsViewAllOpen(false)}
                className="px-8 py-3 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      <PromotionDetailModal
        promo={selectedPromo}
        onClose={() => setSelectedPromo(null)}
      />
    </>
  );
};

export default AIPromotionPage;
