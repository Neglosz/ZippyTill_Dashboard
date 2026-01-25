import React from "react";
import { LogOut, Store } from "lucide-react";

/**
 * SimpleHeader Component
 * Displays the App Logo/Title and a Logout button.
 */
const SimpleHeader = () => {
    return (
        <header className="h-16 bg-white shrink-0 px-8 flex items-center justify-between shadow-sm sticky top-0 z-50">
            {/* Brand / Logo Area */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7B5CFA] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#7B5CFA]/20">
                    <Store size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-[#1B2559] leading-none tracking-tight">EASY FLOW</h1>
                    <span className="text-xs text-gray-500 font-medium mt-0.5">ระบบจัดการคลังสินค้า</span>
                </div>
            </div>

            {/* Actions Area */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#7B5CFA] transition-colors font-medium text-sm">
                <LogOut size={18} />
                <span>ออกจากระบบ</span>
            </button>
        </header>
    );
};

export default SimpleHeader;
