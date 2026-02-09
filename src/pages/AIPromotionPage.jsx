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

const AIPromotionPage = () => {
  const { activeBranchId, activeBranchName } = useBranch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecLoading, setIsRecLoading] = useState(true);
  const [activePromotions, setActivePromotions] = useState([]);
  const [isPromosLoading, setIsPromosLoading] = useState(true);
  const [aiPromoData, setAiPromoData] = useState(null);

  const handleCreateFromAI = (rec) => {
    setAiPromoData(rec);
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

  const topStats = [
    {
      id: 1,
      label: "โปรโมชั่นที่ใช้งาน",
      value: `${activePromotions.filter((p) => p.is_active).length} รายการ`,
      trend: "+15%",
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      id: 2,
      label: "ยอดขายจากโปรโมชั่น",
      value: "฿245,600",
      trend: "+28%",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      id: 3,
      label: "ลูกค้าที่ใช้โปรโมชั่น",
      value: "1,847 คน",
      trend: "+42%",
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
      try {
        setIsRecLoading(true);
        const contextData = {
          branchName: activeBranchName,
          topSellingItems: ["กาแฟอาราบิก้า", "ชาไทยพรีเมียม", "ครัวซองต์เนยสด"],
          stockIssues: ["เค้กส้ม (ใกล้หมดอายุ)", "คุกกี้เนย (สต็อกเยอะ)"],
          currentSeason: "ฤดูหนาว/ตรุษจีน",
        };
        const aiRecs = await getPromotionRecommendations(contextData);
        setRecommendations(aiRecs);
      } catch (error) {
        console.error("Failed to fetch AI recs:", error);
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
      } finally {
        setIsRecLoading(false);
      }
    };

    fetchRecs();
  }, [activeBranchName]);

  useEffect(() => {
    const fetchPromos = async () => {
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
    };

    fetchPromos();
  }, [activeBranchId]);

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

  const formatDateRange = (start, end) => {
    if (!start && !end) return "ไม่มีกำหนด";
    const s = start ? new Date(start).toLocaleDateString("th-TH") : "...";
    const e = end ? new Date(end).toLocaleDateString("th-TH") : "ไม่มีกำหนด";
    return `${s} - ${e}`;
  };

  const getStatusInfo = (isActive, endDate) => {
    const now = new Date();
    const isExpired = endDate && new Date(endDate) < now;
    if (isExpired) return { label: "หมดเขต", color: "bg-gray-400" };
    return isActive
      ? { label: "ใช้งาน", color: "bg-emerald-500" }
      : { label: "ปิดใช้งาน", color: "bg-orange-400" };
  };

  // Mock Data for Chart
  const chartData = [
    { name: "ก.ค.", withPromo: 85000, noPromo: 65000 },
    { name: "ส.ค.", withPromo: 92000, noPromo: 68000 },
    { name: "ก.ย.", withPromo: 88000, noPromo: 70000 },
    { name: "ต.ค.", withPromo: 95000, noPromo: 72000 },
    { name: "พ.ย.", withPromo: 105000, noPromo: 75000 },
    { name: "ธ.ค.", withPromo: 118000, noPromo: 78000 },
  ];

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
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topStats.map((stat) => (
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
                <button className="text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors">
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
                  activePromotions.map((promo) => {
                    const status = getStatusInfo(
                      promo.is_active,
                      promo.end_date,
                    );
                    return (
                      <div
                        key={promo.id}
                        className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-gray-900 mb-1 group-hover:text-primary transition-colors">
                              {promo.name}
                            </h4>
                            <p className="text-[10px] font-bold text-inactive uppercase tracking-wider">
                              ID: {promo.id.slice(0, 8)}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg text-white ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="space-y-3 mb-5">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            <Target size={14} className="text-inactive" />
                            <span>{getPromotionLabel(promo)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            <Calendar size={14} className="text-inactive" />
                            <span>
                              {formatDateRange(
                                promo.start_date,
                                promo.end_date,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            <Package size={14} className="text-inactive" />
                            <span>{promo.itemCount} สินค้า</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-inactive">ประสิทธิภาพ</span>
                            <span className="text-gray-900">
                              {promo.efficiency || 0}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${promo.efficiency || 0}%` }}
                            />
                          </div>
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
                      tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
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
                    />
                    <Legend
                      formatter={(value) =>
                        value === "withPromo" ? "มีโปรโมชั่น" : "ไม่มีโปรโมชั่น"
                      }
                    />
                    <Bar
                      dataKey="withPromo"
                      name="มีโปรโมชั่น"
                      fill="#ED7117" // Primary Orange
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="noPromo"
                      name="ไม่มีโปรโมชั่น"
                      fill="#9CA3AF" // Inactive Gray
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIPromotionPage;
