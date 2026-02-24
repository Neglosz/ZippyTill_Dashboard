import React from "react";
import { useLocation } from "react-router-dom";
import { useBranch } from "../../contexts/BranchContext";
import { useNotifications } from "../../hooks/useNotifications";
import { useCurrentUser } from "../../hooks/useCurrentUser";

// Components
import BranchIndicator from "../common/BranchIndicator";
import HeaderNotifications from "./HeaderNotifications";
import HeaderProfile from "./HeaderProfile";

const Header = () => {
  const location = useLocation();
  const { activeBranchId, activeBranchName } = useBranch();

  // Custom hooks to manage state and side effects
  const { currentUser } = useCurrentUser();
  const { notifications, loading, clearAllNotifications, deleteNotification } =
    useNotifications(activeBranchId);

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
    <header className="h-20 shrink-0 px-8 flex items-center justify-between bg-white shadow-elevation sticky top-0 z-40 relative group/header border-b border-gray-100/50">
      {/* Edge lighting effect - High Dimension */}

      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
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
