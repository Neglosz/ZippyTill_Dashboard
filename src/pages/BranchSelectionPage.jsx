import React from "react";
import SimpleHeader from "../components/layout/SimpleHeader";
import SummaryCard from "../components/common/SummaryCard";
import BranchCard from "../components/features/branch/BranchCard";
import { Store, TrendingUp, ShoppingCart, Users, Search } from "lucide-react";

const handleAction = () => {
  navigate("/dashboard");
};
const BranchSelectionPage = () => {
  // Mock Data based on the screenshot
  const summaryData = [
    {
      icon: <Store size={24} />,
      title: "สาขาทั้งหมด",
      value: "3 สาขา",
      iconBgColor: "bg-[#E9E3FF]",
      iconColor: "text-[#7B5CFA]",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "ยอดขายรวมวันนี้",
      value: "฿757,010",
      iconBgColor: "bg-[#F3E8FF]",
      iconColor: "text-[#A855F7]",
    },
    {
      icon: <ShoppingCart size={24} />,
      title: "คำสั่งซื้อทั้งหมด",
      value: "473 รายการ",
      iconBgColor: "bg-[#FCE7F3]",
      iconColor: "text-[#EC4899]",
    },
    {
      icon: <Users size={24} />,
      title: "พนักงานทั้งหมด",
      value: "37 คน",
      iconBgColor: "bg-[#F3E8FF]",
      iconColor: "text-[#A855F7]",
    },
  ];

  const branchData = [
    {
      id: 1,
      name: "EASY FLOW สาขาสุขุมวิท",
      address: "สุขุมวิท ซอย 21, กรุงเทพฯ",
      salesToday: 245890,
      ordersToday: 156,
      staffCount: 12,
      growth: 18.5,
      imageUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop", // Convenience Store exterior
      isOpen: true,
    },
    {
      id: 2,
      name: "EASY FLOW สาขาสีลม",
      address: "สีลม, บางรัก, กรุงเทพฯ",
      salesToday: 198450,
      ordersToday: 128,
      staffCount: 10,
      growth: 12.3,
      imageUrl: "src/assets/sotre.jpg", // Supermarket Aisle
      isOpen: true,
    },
    {
      id: 3,
      name: "EASY FLOW สาขาพระราม 9",
      address: "พระราม 9, ห้วยขวาง, กรุงเทพฯ",
      salesToday: 312670,
      ordersToday: 189,
      staffCount: 15,
      growth: 22.7,
      imageUrl:
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2574&auto=format&fit=crop", // Convenience Store shelves
      isOpen: true,
    },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#1E2022]">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1E2022] to-[#1F252A] opacity-100 z-0"></div>

      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16 pointer-events-none z-0"></div>

      <div className="relative z-10 w-full">
        <SimpleHeader isDark={true} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col items-center relative z-10">
        {/* Page Title Section */}
        <div className="text-center mb-10 w-full animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-wide">
            เลือกสาขาที่ต้องการจัดการ
          </h2>
          <p className="text-gray-400 font-medium text-lg">
            คุณสามารถเข้าถึงข้อมูลและจัดการทุกสาขาได้จากที่เดียว
          </p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12 animate-fade-in-up delay-100">
          {summaryData.map((item, index) => (
            <SummaryCard key={index} {...item} isDark={true} />
          ))}
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-fade-in-up delay-200">
          {branchData.map((branch) => (
            <BranchCard
              key={branch.id}
              branchName={branch.name}
              {...branch}
              isDark={true}
            />
          ))}
        </div>
      </main>

      <footer className="py-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/5 text-sm text-gray-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="font-semibold text-white">
            ทุกสาขาพร้อมให้บริการ
          </span>
          <span className="text-gray-500">|</span>
          <span>อัพเดทล่าสุด: วันนี้ 14:35 น.</span>
        </div>
      </footer>
    </div>
  );
};

export default BranchSelectionPage;
