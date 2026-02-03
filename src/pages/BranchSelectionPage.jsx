import React from "react";
import SimpleHeader from "../components/layout/SimpleHeader";
import SummaryCard from "../components/common/SummaryCard";
import BranchCard from "../components/features/branch/BranchCard";
import {
  Store,
  TrendingUp,
  ShoppingCart,
  Users,
  Search,
  Sparkles,
} from "lucide-react";

const BranchSelectionPage = () => {
  // Mock Data based on the screenshot
  const summaryData = [
    {
      icon: <Store size={24} />,
      title: "สาขาทั้งหมด",
      value: "3 สาขา",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "ยอดขายรวมวันนี้",
      value: "฿757,010",
    },
    {
      icon: <ShoppingCart size={24} />,
      title: "คำสั่งซื้อทั้งหมด",
      value: "473 รายการ",
    },
    {
      icon: <Users size={24} />,
      title: "พนักงานทั้งหมด",
      value: "37 คน",
    },
  ];

  const branchData = [
    {
      id: 1,
      name: "ZIPPY TILL สาขาสุขุมวิท",
      address: "สุขุมวิท ซอย 21, กรุงเทพฯ",
      salesToday: 245890,
      ordersToday: 156,
      staffCount: 12,
      growth: 18.5,
      imageUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop",
      isOpen: true,
    },
    {
      id: 2,
      name: "ZIPPY TILL สาขาสีลม",
      address: "สีลม, บางรัก, กรุงเทพฯ",
      salesToday: 198450,
      ordersToday: 128,
      staffCount: 10,
      growth: 12.3,
      imageUrl:
        "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?q=80&w=2574&auto=format&fit=crop",
      isOpen: true,
    },
    {
      id: 3,
      name: "ZIPPY TILL สาขาพระราม 9",
      address: "พระราม 9, ห้วยขวาง, กรุงเทพฯ",
      salesToday: 312670,
      ordersToday: 189,
      staffCount: 15,
      growth: 22.7,
      imageUrl:
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2574&auto=format&fit=crop",
      isOpen: true,
    },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#F9FAFB]">
      {/* Background Decorative Blob - Refined */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        <SimpleHeader isDark={false} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:p-14 flex flex-col items-center relative z-10">
        {/* Page Title Section */}
        <div className="text-center mb-16 w-full max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
            เลือกสาขาที่จัดการ
          </h2>
          <p className="text-inactive font-black text-[10px] uppercase tracking-[0.4em] leading-relaxed">
            เชื่อมต่อข้อมูลและบริหารจัดการทุกสาขา{" "}
            <br className="hidden sm:block" /> อย่างมีประสิทธิภาพในที่เดียว
          </p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-16">
          {summaryData.map((item, index) => (
            <SummaryCard key={index} {...item} isDark={false} />
          ))}
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {branchData.map((branch) => (
            <BranchCard
              key={branch.id}
              branchName={branch.name}
              {...branch}
              isDark={false}
            />
          ))}
        </div>
      </main>

      <footer className="py-12 text-center relative z-10">
        <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-3xl shadow-premium border border-gray-100 text-[10px] font-black uppercase tracking-widest text-inactive">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
          <span className="text-gray-900">ทุกสาขาพร้อมให้บริการ</span>
          <span className="text-gray-200">|</span>
          <span>อัพเดทล่าสุด: วันนี้ 14:35 น.</span>
        </div>
      </footer>
    </div>
  );
};

export default BranchSelectionPage;
