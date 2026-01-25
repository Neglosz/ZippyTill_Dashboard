import React from "react";
import { MapPin, TrendingUp, ShoppingCart, Users, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BranchCard = ({
    branchName,
    address,
    salesToday,
    ordersToday,
    staffCount,
    growth,
    imageUrl,
    isOpen = true
}) => {
    const navigate = useNavigate();

    const handleAction = () => {
        navigate("/dashboard");
    };

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
            {/* Image Area */}
            <div className="relative h-48 overflow-hidden">
                <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 ${isOpen ? "bg-white/90 text-green-600 shadow-sm" : "bg-gray-100 text-gray-500"
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                    {isOpen ? "เปิดทำการ" : "ปิดทำการ"}
                </div>
                <img
                    src={imageUrl}
                    alt={branchName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#1B2559] mb-1 group-hover:text-[#7B5CFA] transition-colors">{branchName}</h3>
                <div className="flex items-center text-gray-500 text-xs mb-6">
                    <MapPin size={14} className="mr-1.5 text-gray-400" />
                    {address}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                    {/* Sales Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FE]/50 hover:bg-[#F4F7FE] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#E9E3FF] text-[#7B5CFA] flex items-center justify-center">
                                <TrendingUp size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">ยอดขายวันนี้</span>
                        </div>
                        <span className="text-sm font-bold text-[#1B2559]">฿{salesToday.toLocaleString()}</span>
                    </div>

                    {/* Orders Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FE]/50 hover:bg-[#F4F7FE] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#F8E7FF] text-[#C026D3] flex items-center justify-center">
                                <ShoppingCart size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">คำสั่งซื้อ</span>
                        </div>
                        <span className="text-sm font-bold text-[#1B2559]">{ordersToday} รายการ</span>
                    </div>

                    {/* Staff Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FE]/50 hover:bg-[#F4F7FE] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#F1F0FF] text-[#8B5CF6] flex items-center justify-center">
                                <Users size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">พนักงาน</span>
                        </div>
                        <span className="text-sm font-bold text-[#1B2559]">{staffCount} คน</span>
                    </div>

                    {/* Growth Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                <BarChart3 size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">เติบโต</span>
                        </div>
                        <span className="text-sm font-bold text-green-500">+{growth}%</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                    <button className="w-full py-3 rounded-xl bg-[#7B5CFA] text-white font-semibold shadow-lg shadow-[#7B5CFA]/30 hover:shadow-[#7B5CFA]/50 hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                        onClick={handleAction}>
                        เข้าสู่ระบบจัดการ
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchCard;
