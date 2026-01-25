import React from "react";
import SimpleHeader from "../components/layout/SimpleHeader";
import SummaryCard from "../components/common/SummaryCard";
import BranchCard from "../components/features/branch/BranchCard";
import { Store, TrendingUp, ShoppingCart, Users, Search } from "lucide-react";

const handleAction = () => {
    navigate("/dashboard");
}
const BranchSelectionPage = () => {
    // Mock Data based on the screenshot
    const summaryData = [
        {
            icon: <Store size={24} />,
            title: "สาขาทั้งหมด",
            value: "3 สาขา",
            iconBgColor: "bg-[#E9E3FF]",
            iconColor: "text-[#7B5CFA]"
        },
        {
            icon: <TrendingUp size={24} />,
            title: "ยอดขายรวมวันนี้",
            value: "฿757,010",
            iconBgColor: "bg-[#F3E8FF]",
            iconColor: "text-[#A855F7]"
        },
        {
            icon: <ShoppingCart size={24} />,
            title: "คำสั่งซื้อทั้งหมด",
            value: "473 รายการ",
            iconBgColor: "bg-[#FCE7F3]",
            iconColor: "text-[#EC4899]"
        },
        {
            icon: <Users size={24} />,
            title: "พนักงานทั้งหมด",
            value: "37 คน",
            iconBgColor: "bg-[#F3E8FF]",
            iconColor: "text-[#A855F7]"
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
            imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop", // Convenience Store exterior
            isOpen: true
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
            isOpen: true
        },
        {
            id: 3,
            name: "EASY FLOW สาขาพระราม 9",
            address: "พระราม 9, ห้วยขวาง, กรุงเทพฯ",
            salesToday: 312670,
            ordersToday: 189,
            staffCount: 15,
            growth: 22.7,
            imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2574&auto=format&fit=crop", // Convenience Store shelves
            isOpen: true
        }
    ];

    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans flex flex-col">
            <SimpleHeader />

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col items-center">

                {/* Page Title Section */}
                <div className="text-center mb-10 w-full animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-[#1B2559] mb-3">เลือกสาขาที่ต้องการจัดการ</h2>
                    <p className="text-gray-500 font-medium text-lg">คุณสามารถเข้าถึงข้อมูลและจัดการทุกสาขาได้จากที่เดียว</p>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12 animate-fade-in-up delay-100">
                    {summaryData.map((item, index) => (
                        <SummaryCard key={index} {...item} />
                    ))}
                </div>

                {/* Branch Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-fade-in-up delay-200">
                    {branchData.map((branch) => (
                        <BranchCard key={branch.id} branchName={branch.name} {...branch} />
                    ))}
                </div>

            </main>

            <footer className="py-6 text-center">
                <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-700">ทุกสาขาพร้อมให้บริการ</span>
                    <span className="text-gray-300">|</span>
                    <span>อัพเดทล่าสุด: วันนี้ 14:35 น.</span>
                </div>
            </footer>
        </div>
    );
};

export default BranchSelectionPage;
