import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  MoreHorizontal,
  Plus,
  RotateCw,
  Target,
  Calendar,
  Package,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  const [timeRange, setTimeRange] = useState("monthly");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State for delete confirmation
  const [selectedPromoIds, setSelectedPromoIds] = useState([]); // State for bulk selection
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [, setTick] = useState(0);
  const lastFetchedBranchId = React.useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeletePromotion = async () => {
    if (!deleteConfirm) return;
    try {
      if (Array.isArray(deleteConfirm)) {
        setIsBulkDeleting(true);
        await Promise.all(deleteConfirm.map(p => promotionService.deletePromotion(p.id)));
        setSelectedPromoIds([]);
      } else {
        await promotionService.deletePromotion(deleteConfirm.id);
      }
      fetchPromos();
      fetchChartData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      alert("ไม่สามารถลบโปรโมชั่นได้");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectPromo = (id, e) => {
    e.stopPropagation();
    setSelectedPromoIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllPromos = () => {
    if (selectedPromoIds.length === sortedPromotions.length) {
      setSelectedPromoIds([]);
    } else {
      setSelectedPromoIds(sortedPromotions.map(p => p.id));
    }
  };

  const parseLocalDate = useCallback((dateStr, isEndDate = false) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return isEndDate
        ? new Date(year, month - 1, day, 23, 59, 59)
        : new Date(year, month - 1, day, 0, 0, 0);
    }
    return new Date(dateStr);
  }, []);

  const getStatusInfo = useCallback(
    (isActive, endDate) => {
      if (!isActive) return { label: "ปิดใช้งาน", color: "bg-gray-400" };
      if (parseLocalDate(endDate, true) < new Date())
        return { label: "หมดอายุ", color: "bg-red-500" };
      return { label: "ใช้งาน", color: "bg-emerald-500" };
    },
    [parseLocalDate],
  );

  const sortedPromotions = useMemo(() => {
    return [...activePromotions].sort((a, b) => {
      const statusA = getStatusInfo(a.is_active, a.end_date).label;
      const statusB = getStatusInfo(b.is_active, b.end_date).label;
      const priority = { ใช้งาน: 1, หมดอายุ: 2, ปิดใช้งาน: 3 };
      const diff = (priority[statusA] || 99) - (priority[statusB] || 99);
      if (diff !== 0) return diff;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [activePromotions, getStatusInfo]);

  const fetchRecs = useCallback(
    async (forceRefresh = false) => {
      if (!activeBranchId) return;
      if (!forceRefresh && lastFetchedBranchId.current === activeBranchId)
        return;

      const cachedData = forceRefresh ? null : getCache();
      if (cachedData) {
        setRecommendations(cachedData);
        setIsRecLoading(false);
        lastFetchedBranchId.current = activeBranchId;
        return;
      }

      setIsRecLoading(true);
      try {
        const aiRecs = await aiService.getPromotionRecommendations(
          activeBranchId,
          activeBranchName,
        );
        setRecommendations(aiRecs);
        setCache(aiRecs);
        lastFetchedBranchId.current = activeBranchId;
      } catch (error) {
        console.error("Failed to fetch AI recs:", error);
      } finally {
        setIsRecLoading(false);
      }
    },
    [activeBranchId, activeBranchName, getCache, setCache],
  );

  const fetchPromos = useCallback(async () => {
    if (!activeBranchId) return;
    try {
      setIsPromosLoading(true);
      const data = await promotionService.getPromotions(activeBranchId);
      setActivePromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setIsPromosLoading(false);
    }
  }, [activeBranchId]);

  const fetchChartData = useCallback(async () => {
    if (!activeBranchId) return;
    try {
      setIsChartLoading(true);
      const now = new Date();
      let startDateStr;

      if (timeRange === "daily") {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        d.setHours(0, 0, 0, 0);
        startDateStr = d.toISOString();
      } else if (timeRange === "monthly") {
        const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDateStr = d.toISOString();
      } else {
        const d = new Date(now.getFullYear() - 4, 0, 1);
        startDateStr = d.toISOString();
      }

      const { data: items, error } = await supabase
        .from("order_items")
        .select(`subtotal, promotion_id, orders!inner ( created_at, store_id )`)
        .eq("orders.store_id", activeBranchId)
        .gte("orders.created_at", startDateStr);

      if (error) throw error;

      const buckets = [];
      if (timeRange === "daily") {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          buckets.push({
            dateObj: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
            name: d.toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
            }),
            withPromo: 0,
            noPromo: 0,
          });
        }
      } else if (timeRange === "monthly") {
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
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          buckets.push({
            month: d.getMonth(),
            year: d.getFullYear(),
            name:
              thaiMonths[d.getMonth()] +
              " " +
              String(d.getFullYear() + 543).slice(-2),
            withPromo: 0,
            noPromo: 0,
          });
        }
      } else {
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now.getFullYear() - i, 0, 1);
          buckets.push({
            year: d.getFullYear(),
            name: String(d.getFullYear() + 543),
            withPromo: 0,
            noPromo: 0,
          });
        }
      }

      (items || []).forEach((item) => {
        const createdAt = item.orders?.created_at;
        if (!createdAt) return;
        const d = new Date(createdAt);
        let bucket = buckets.find((b) => {
          if (timeRange === "daily")
            return (
              d.getDate() === b.dateObj.getDate() &&
              d.getMonth() === b.dateObj.getMonth() &&
              d.getFullYear() === b.dateObj.getFullYear()
            );
          if (timeRange === "monthly")
            return b.month === d.getMonth() && b.year === d.getFullYear();
          return b.year === d.getFullYear();
        });
        if (!bucket) return;
        const amount = parseFloat(item.subtotal) || 0;
        if (item.promotion_id) bucket.withPromo += amount;
        else bucket.noPromo += amount;
      });

      setChartData(
        buckets.map((m) => ({
          ...m,
          withPromo: m.withPromo > 0 ? m.withPromo : null,
          noPromo: m.noPromo > 0 ? m.noPromo : null,
        })),
      );
    } catch (err) {
      console.error("fetchChartData error:", err);
    } finally {
      setIsChartLoading(false);
    }
  }, [activeBranchId, timeRange]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);
  useEffect(() => { fetchPromos(); }, [fetchPromos]);
  useEffect(() => { fetchChartData(); }, [fetchChartData, timeRange]);

  // Real-time Subscriptions
  useEffect(() => {
    if (!activeBranchId) return;

    // 1. Listen to changes in promotions table
    const promoChannel = supabase
      .channel('promo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promotions',
          filter: `store_id=eq.${activeBranchId}`,
        },
        () => {
          console.log("🔔 Promotion change detected, refreshing...");
          fetchPromos();
        }
      )
      .subscribe();

    // 2. Listen to new sales (orders) to update charts and stats
    const orderChannel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${activeBranchId}`,
        },
        () => {
          console.log("💰 New sale detected, updating real-time data...");
          fetchChartData();
          fetchPromos(); // Promos might have updated sales/customer counts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promoChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [activeBranchId, fetchPromos, fetchChartData]);

  // Real-time Subscriptions
  useEffect(() => {
    if (!activeBranchId) return;

    // 1. Listen to changes in promotions table
    const promoChannel = supabase
      .channel('promo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promotions',
          filter: `store_id=eq.${activeBranchId}`,
        },
        () => {
          console.log("🔔 Promotion change detected, refreshing...");
          fetchPromos();
        }
      )
      .subscribe();

    // 2. Listen to new sales (orders) to update charts and stats
    const orderChannel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${activeBranchId}`,
        },
        () => {
          console.log("💰 New sale detected, updating real-time data...");
          fetchChartData();
          fetchPromos(); // Promos might have updated sales/customer counts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promoChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [activeBranchId, fetchPromos, fetchChartData]);

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
        icon: Zap,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
      },
      {
        id: 2,
        label: "ยอดขายจากโปรโมชั่น",
        value: totalSales > 0 ? `฿${totalSales.toLocaleString()}` : "฿0",
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
        icon: Users,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      },
      {
        id: 4,
        label: "คำแนะนำจาก AI",
        value: `${recommendations.length} รายการ`,
        icon: Sparkles,
        color: "text-orange-600",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      },
    ];
  }, [activePromotions, recommendations.length]);

  const getTimeRemaining = useCallback(
    (startDate, endDate) => {
      const now = new Date();
      const start = parseLocalDate(startDate) || now;
      const end = parseLocalDate(endDate, true);
      if (!end)
        return {
          text: "ไม่มีกำหนด",
          percentage: 0,
          color: "from-emerald-500 to-emerald-600",
        };
      const total = end - start;
      const remaining = end - now;
      if (remaining <= 0)
        return {
          text: "หมดเวลา",
          percentage: 100,
          color: "from-red-500 to-red-600",
        };

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      const percentage = Math.max(
        0,
        Math.min(100, ((now - start) / total) * 100),
      );

      let color =
        100 - percentage > 50
          ? "from-emerald-500 to-emerald-600"
          : 100 - percentage > 20
            ? "from-yellow-500 to-yellow-600"
            : "from-red-500 to-red-600";
      let text = `${days}วัน ${hours}ชม ${minutes}น ${seconds}วิ`;
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
          description="วิเคราะห์และสร้างโปรโมชั่นด้วย AI"
          icon={Sparkles}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 text-white rounded-2xl font-bold shadow-lg hover:-translate-y-1 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            <span>สร้างใหม่</span>
          </button>
        </PageHeader>

        <CreatePromotionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setAiPromoData(null);
          }}
          initialData={aiPromoData}
          onPromotionCreated={() => {
            fetchPromos();
            fetchChartData();
            setIsModalOpen(false);
          }}
        />
        <PromotionDetailModal
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
          onDeleteSuccess={() => {
            fetchPromos();
            fetchChartData();
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-[28px] p-6 shadow-premium border border-gray-100 group relative overflow-hidden"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.border} border mb-4`}
              >
                <stat.icon
                  className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`}
                />
              </div>
              <p className="text-inactive text-xs font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-white rounded-[32px] p-6 shadow-premium border border-gray-100 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Sparkles className="text-orange-500 w-5 h-5" /> คำแนะนำจาก AI
              </h3>
              <button
                onClick={() => fetchRecs(true)}
                disabled={isRecLoading}
                className="text-inactive hover:text-primary transition-all"
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
                    กำลังวิเคราะห์...
                  </p>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">{rec.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        {rec.benefit}
                      </span>
                      <button
                        onClick={() => {
                          setUsedRecId(rec.id);
                          setAiPromoData(rec);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg"
                      >
                        สร้างเลย
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  โปรโมชั่นที่ใช้งานอยู่ ({activePromotions.length})
                </h3>
                <button
                  onClick={() => setIsViewAllOpen(true)}
                  className="text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl"
                >
                  ดูทั้งหมด
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedPromotions.slice(0, 4).map((promo) => {
                  const status = getStatusInfo(promo.is_active, promo.end_date);
                  const time = getTimeRemaining(
                    promo.start_date,
                    promo.end_date,
                  );
                  return (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromo(promo)}
                      className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer group relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(promo);
                        }}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10 border border-gray-100 shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-gray-900 text-sm group-hover:text-primary truncate pr-10">
                          {promo.name}
                        </h4>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                          <Target size={12} className="text-primary" />{" "}
                          {promo.discount_value}% Discount
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                          <Package size={12} className="text-emerald-500" />{" "}
                          {promo.itemCount} Items
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-black mb-1">
                        <span className="text-inactive">เวลาเหลือ</span>
                        <span>{time.text}</span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${time.color}`}
                          style={{ width: `${100 - time.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  ผลลัพธ์โปรโมชั่น
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {["daily", "monthly", "yearly"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold ${timeRange === r ? "bg-white text-primary shadow-sm" : "text-gray-500"}`}
                    >
                      {r === "daily" ? "วัน" : r === "monthly" ? "เดือน" : "ปี"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full min-h-[300px]">
                {isChartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RotateCw className="animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        tickFormatter={(v) =>
                          `฿${v >= 1000 ? v / 1000 + "k" : v}`
                        }
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value) => [`฿${Number(value).toLocaleString()}`, undefined]}
                      />
                      <Bar
                        dataKey="withPromo"
                        name="ยอดขายจากโปรโมชั่น"
                        fill="#ED7117"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="noPromo"
                        name="ยอดขายปกติ"
                        fill="#9CA3AF"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isViewAllOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsViewAllOpen(false)}
          />
          <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-gray-900">
                  โปรโมชั่นทั้งหมด
                </h2>
                <button
                  onClick={selectAllPromos}
                  className="text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 hover:bg-primary/10 transition-all"
                >
                  {selectedPromoIds.length === sortedPromotions.length ? "เลือกทั้งหมด" : "ยกเลิกเลือกทั้งหมด"}
                </button>
                {selectedPromoIds.length > 0 && (
                  <button
                    onClick={() => {
                      const promosToDelete = sortedPromotions.filter(p => selectedPromoIds.includes(p.id));
                      setDeleteConfirm(promosToDelete);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                    <span>ลบ ({selectedPromoIds.length} รายการ)</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsViewAllOpen(false);
                  setSelectedPromoIds([]);
                }}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-inactive hover:text-primary transition-all"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
              {sortedPromotions.map((promo) => {
                const status = getStatusInfo(promo.is_active, promo.end_date);
                const isSelected = selectedPromoIds.includes(promo.id);
                return (
                  <div
                    key={promo.id}
                    onClick={() => {
                      setSelectedPromo(promo);
                      setIsViewAllOpen(false);
                    }}
                    className={`bg-gray-50 p-5 pb-4 rounded-[24px] border transition-all cursor-pointer relative group ${isSelected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-gray-100 hover:border-primary/20"}`}
                  >
                    {/* Selection Checkbox */}
                    <div 
                      onClick={(e) => toggleSelectPromo(promo.id, e)}
                      className={`absolute top-4 left-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-10 ${isSelected ? "bg-primary border-primary" : "bg-white border-gray-200 group-hover:border-primary/40"}`}
                    >
                      {isSelected && <Plus size={14} className="text-white rotate-0" strokeWidth={4} />}
                    </div>

                    <div className="flex justify-between mb-4 pl-8">
                      <h4 className="font-black text-gray-900 text-sm truncate pr-2">
                        {promo.name}
                      </h4>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-600 space-y-2 mb-4 pl-8">
                      <div className="flex items-center gap-2">
                        <Target size={12} className="text-primary" />{" "}
                        {promo.discount_value}% Off
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-blue-500" />{" "}
                        {new Date(promo.start_date).toLocaleDateString("th-TH")}
                      </div>
                    </div>
                    
                    {/* Individual Delete Button at Bottom */}
                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(promo);
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-black text-red-400 hover:text-red-500 transition-all px-2 py-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                        <span>ลบโปรโมชั่น</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {Array.isArray(deleteConfirm) ? `ยืนยันการลบ ${deleteConfirm.length} โปรโมชั่น?` : "ยืนยันการลบโปรโมชั่น?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {Array.isArray(deleteConfirm) 
                ? "โปรโมชั่นที่เลือกทั้งหมดจะถูกลบออกถาวร" 
                : `การลบโปรโมชั่น "${deleteConfirm.name}" ไม่สามารถกู้คืนได้`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isBulkDeleting}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeletePromotion}
                disabled={isBulkDeleting}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <span>ยืนยันลบ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIPromotionPage;
