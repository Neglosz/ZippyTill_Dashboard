import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
  Zap,
  ArrowRight,
  MoreHorizontal,
  Plus,
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
import CreatePromotionModal from "../components/modals/CreatePromotionModal";
import { useBranch } from "../contexts/BranchContext";
import { getPromotionRecommendations } from "../../AI/geminiAPI";
import { promotionService } from "../services/promotionService";
import { supabase } from "../lib/supabase";

const AIPromotionPage = () => {
  const { activeBranchId, activeBranchName } = useBranch();

  // Cache utilities for AI recommendations
  const CACHE_KEY = "ai_promo_recommendations";
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  const getCache = () => {
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
  };

  const setCache = (data) => {
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
  };
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

  const handleCreateFromAI = (rec) => {
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
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setAiPromoData(null);
  };

  const getIcon = (iconName) => {
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
  };

  // Calculate real stats from active promotions
  const activePromosCount = activePromotions.filter((p) => p.is_active).length;
  const totalSales = activePromotions.reduce(
    (sum, p) => sum + (p.total_sales || 0),
    0,
  );
  const totalCustomers = activePromotions.reduce(
    (sum, p) => sum + (p.customer_count || 0),
    0,
  );

  const stats = [
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

  useEffect(() => {
    const fetchRecs = async () => {
      if (!activeBranchId) return;

      // Try to load from cache first
      const cachedData = getCache();
      if (cachedData) {
        console.log("📦 Loading recommendations from cache");
        setRecommendations(cachedData);
        setIsRecLoading(false); // Show cached data immediately
      } else {
        setRecommendations([]); // Clear old state for new branch
        setIsRecLoading(true);
      }

      // Fetch fresh data in background
      try {
        console.log("🔄 Fetching fresh AI recommendations...");
        const aiRecs = await getPromotionRecommendations(
          activeBranchId,
          activeBranchName,
        );
        setRecommendations(aiRecs);
        setCache(aiRecs); // Update cache
        console.log("✅ Fresh recommendations loaded and cached");
      } catch (error) {
        console.error("Failed to fetch AI recs:", error);
        // Only show fallback if no cache available
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
    };

    fetchRecs();
  }, [activeBranchId, activeBranchName]);

  const fetchPromos = async () => {
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
  };

  useEffect(() => {
    fetchPromos();
    fetchChartData();
  }, [activeBranchId]);

  const handlePromotionCreated = () => {
    // Remove the used recommendation from the list
    if (usedRecId !== null) {
      setRecommendations((prev) => prev.filter((r) => r.id !== usedRecId));
      setUsedRecId(null);
    }
    fetchPromos();
    fetchChartData();
    setIsModalOpen(false);
  };

  // Fetch real chart data: orders this year split by whether a promotion was active
  const fetchChartData = async () => {
    if (!activeBranchId) return;
    try {
      setIsChartLoading(true);
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1).toISOString();

      // Fetch all orders this year
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("store_id", activeBranchId)
        .gte("created_at", startOfYear);
      if (ordersError) throw ordersError;

      // Fetch all promotions for this branch
      const { data: promos, error: promosError } = await supabase
        .from("promotions")
        .select("start_date, end_date, is_active")
        .eq("store_id", activeBranchId)
        .eq("is_active", true);
      if (promosError) throw promosError;

      // Build monthly buckets for last 6 months
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

      // Helper: check if a given date falls within any promotion period
      const isInPromo = (dateStr) => {
        const d = new Date(dateStr);
        return promos.some((p) => {
          const start = p.start_date ? new Date(p.start_date) : null;
          const end = p.end_date ? new Date(p.end_date) : null;
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });
      };

      // Bucket each order
      (orders || []).forEach((o) => {
        const d = new Date(o.created_at);
        const bucket = months.find(
          (m) => m.month === d.getMonth() && m.year === d.getFullYear(),
        );
        if (!bucket) return;
        if (isInPromo(o.created_at)) {
          bucket.withPromo += o.total_amount || 0;
        } else {
          bucket.noPromo += o.total_amount || 0;
        }
      });

      setChartData(months);
    } catch (err) {
      console.error("fetchChartData error:", err);
    } finally {
      setIsChartLoading(false);
    }
  };

  const getPromotionLabel = (promo) => {
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
  };

  // Parse date string as LOCAL midnight to avoid UTC +7 offset issues
  // new Date("2026-02-24") → UTC midnight → 07:00 Thailand → loses 7 hours
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    // If it's a date-only string YYYY-MM-DD, parse as local midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day, 23, 59, 59); // Local end of day
    }
    return new Date(dateStr);
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return "ไม่มีกำหนด";
    const s = start ? parseLocalDate(start).toLocaleDateString("th-TH") : "...";
    const e = end
      ? parseLocalDate(end).toLocaleDateString("th-TH")
      : "ไม่มีกำหนด";
    return `${s} - ${e}`;
  };

  const getStatusInfo = (isActive, endDate) => {
    if (!isActive) return { label: "ปิดใช้งาน", color: "bg-gray-400" };
    if (parseLocalDate(endDate) < new Date())
      return { label: "หมดอายุ", color: "bg-red-500" };
    return { label: "ใช้งาน", color: "bg-emerald-500" };
  };

  const getTimeRemaining = (startDate, endDate) => {
    const now = new Date();
    const start = parseLocalDate(startDate) || now;
    const end = parseLocalDate(endDate);
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
      text = `${days} วัน ${hours} ชั่วโมง`;
    } else if (hours > 0) {
      text = `${hours} ชั่วโมง ${minutes} นาที`;
    } else {
      text = `${minutes} นาที`;
    }

    return { text, percentage, color };
  };

  return (
    <>
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-orange-500/5 rounded-full blur-[110px]" />
      </div>

      <div className="relative pb-10 space-y-6 min-h-screen font-sans">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <Sparkles className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                AI โปรโมชั่น
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                ใช้ AI ของสาขาช่วยวิเคราะห์และสร้างโปรโมชั่นที่เหมาะสมที่สุด
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            <Plus size={20} strokeWidth={3} />
            <span>สร้างด้วย AI</span>
          </button>
        </div>

        <CreatePromotionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialData={aiPromoData}
          onPromotionCreated={handlePromotionCreated}
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
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-orange-500 w-5 h-5" />
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  คำแนะนำจาก AI
                </h3>
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
                              promo.start_date,
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
                      <Legend
                        formatter={(value) =>
                          value === "withPromo"
                            ? "มีโปรโมชั่น"
                            : "ไม่มีโปรโมชั่น"
                        }
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
                            promo.start_date,
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

      {/* Promotion Detail Modal */}
      {selectedPromo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedPromo(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-orange-50 p-8 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg text-white ${
                        getStatusInfo(
                          selectedPromo.is_active,
                          selectedPromo.end_date,
                        ).color
                      }`}
                    >
                      {
                        getStatusInfo(
                          selectedPromo.is_active,
                          selectedPromo.end_date,
                        ).label
                      }
                    </span>
                    <span className="text-[10px] font-bold text-inactive uppercase tracking-wider">
                      ID: {selectedPromo.id.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                    {selectedPromo.name}
                  </h2>
                  {selectedPromo.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPromo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPromo(null)}
                  className="w-10 h-10 bg-white/80 rounded-2xl flex items-center justify-center text-inactive hover:text-primary hover:bg-primary/5 transition-all border border-gray-100 shadow-sm shrink-0"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-4">
              {/* Discount Type */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Target size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-inactive uppercase tracking-wider mb-0.5">
                    ประเภทส่วนลด
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    {getPromotionLabel(selectedPromo)}
                  </p>
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-inactive uppercase tracking-wider mb-0.5">
                    ระยะเวลา
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    {formatDateRange(
                      selectedPromo.start_date,
                      selectedPromo.end_date,
                    )}
                  </p>
                </div>
              </div>

              {/* Products Count */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-inactive uppercase tracking-wider mb-0.5">
                    สินค้าที่ร่วมรายการ
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    {selectedPromo.itemCount || 0} สินค้า
                  </p>
                </div>
              </div>

              {/* Time Remaining */}
              {selectedPromo.end_date &&
                (() => {
                  const tr = getTimeRemaining(
                    selectedPromo.start_date,
                    selectedPromo.end_date,
                  );
                  return (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex justify-between mb-3">
                        <p className="text-[10px] font-black text-inactive uppercase tracking-wider">
                          เวลาที่เหลือ
                        </p>
                        <p className="text-[10px] font-black text-gray-900">
                          {tr.text}
                        </p>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${tr.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${100 - tr.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8">
              <button
                onClick={() => setSelectedPromo(null)}
                className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIPromotionPage;
