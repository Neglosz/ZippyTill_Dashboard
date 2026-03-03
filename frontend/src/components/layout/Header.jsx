import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useBranch } from "../../contexts/BranchContext";
import { useNotifications } from "../../hooks/useNotifications";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { RotateCw } from "lucide-react";

// Components
import BranchIndicator from "../common/BranchIndicator";
import HeaderNotifications from "./HeaderNotifications";
import HeaderProfile from "./HeaderProfile";

const Header = () => {
  const location = useLocation();
  const { activeBranchId, activeBranchName } = useBranch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Custom hooks to manage state and side effects
  const { currentUser } = useCurrentUser();
  const { notifications, loading, clearAllNotifications, deleteNotification } =
    useNotifications(activeBranchId);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    // Add a small delay for visual feedback before reloading
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Dynamic title mapping based on current route
  const getTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") return "ภาพรวม";
    if (path.includes("overdue")) return "รายการค้างชำระ";
    if (path.includes("stock")) return "คลังสินค้า";
    if (path.includes("finance")) return "การเงิน";
    if (path.includes("sales")) return "ยอดขาย";
    if (path.includes("tax")) return "ภาษี";
    return "เมนูหลัก";
  };

  return (
    <header className="h-20 shrink-0 px-8 flex items-center justify-between bg-white/70 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] sticky top-0 z-40 relative group/header border-b border-white/40">
      {/* Dynamic background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none opacity-50" />
      
      <div className="flex flex-col relative z-10">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Manual Refresh Button - Enhanced with Background */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`relative p-3 rounded-2xl transition-all duration-500 shadow-sm border overflow-hidden group/refresh ${
            isRefreshing 
              ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" 
              : "bg-white hover:bg-primary/5 border-gray-100 hover:border-primary/20 hover:shadow-md active:scale-95 cursor-pointer"
          }`}
          title="รีเฟรชข้อมูลทั้งหมด"
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover/refresh:opacity-100 transition-opacity duration-500" />
          
          <RotateCw
            size={18}
            strokeWidth={2.5}
            className={`relative z-10 text-gray-500 group-hover/refresh:text-primary transition-all duration-700 ${
              isRefreshing ? "animate-spin text-primary" : ""
            }`}
          />
        </button>

        <HeaderNotifications
          notifications={notifications}
          loading={loading}
          onClearAll={clearAllNotifications}
          onDelete={deleteNotification}
        />

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-gray-100 mx-1" />

        <BranchIndicator branchName={activeBranchName} />

        <HeaderProfile currentUser={currentUser} />
      </div>
    </header>
  );
};

export default Header;
