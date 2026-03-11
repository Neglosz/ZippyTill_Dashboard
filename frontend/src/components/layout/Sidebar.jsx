import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  Wallet,
  Percent,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "../modals/ConfirmModal";

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem("zippy_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        const saved = localStorage.getItem("zippy_sidebar_open");
        setIsOpen(saved !== null ? saved === "true" : true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("zippy_sidebar_open", newState);
  };
  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "หน้าหลัก",
      path: "/dashboard",
    },
    {
      id: "overdue",
      icon: Users,
      label: "ค้างชำระ",
      path: "/dashboard/overdue",
    },
    { id: "stock", icon: Package, label: "คลัง", path: "/dashboard/stock" },
    {
      id: "sales",
      icon: TrendingUp,
      label: "ยอดขาย",
      path: "/dashboard/sales",
    },
    {
      id: "finance",
      icon: Wallet,
      label: "การเงิน",
      path: "/dashboard/finance",
    },
    { id: "tax", icon: Percent, label: "ภาษี", path: "/dashboard/tax" },
    {
      id: "promo",
      icon: Sparkles,
      label: "AI โปรโมชั่น",
      path: "/dashboard/ai-promo",
    },
  ];

  return (
    <aside
      className={`${isOpen ? "w-[240px]" : "w-[88px]"} bg-white border-r border-gray-100 shadow-elevation flex flex-col justify-between shrink-0 h-screen sticky top-0 z-[30] relative group/sidebar transition-all duration-300`}
    >
      {/* Edge lighting effect - High Dimension */}

      <div>
        <div
          className={`p-8 pb-10 flex items-center justify-center group/logo cursor-pointer ${!isOpen ? "px-4" : ""}`}
        >
          <div className="relative" onClick={toggleSidebar}>
            <h1
              className={`font-black text-gray-900 tracking-tighter group-hover/logo:text-primary transition-colors duration-500 ${isOpen ? "text-2xl" : "text-xl"}`}
            >
              {isOpen ? "ZIPPY TILL" : "ZT"}
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-0 group-hover/logo:w-full transition-all duration-700 ease-out" />
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-2.5 overflow-x-hidden">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              replace
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center ${isOpen ? "gap-4 px-5" : "justify-center px-0"} py-4 rounded-[12px] text-sm font-bold transition-all duration-300 group relative ${
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-inactive hover:text-gray-900 hover:bg-gray-50"
                }`
              }
              title={!isOpen ? item.label : ""}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 3 : 2}
                    className={`shrink-0 transition-all duration-500 ${isOpen ? "group-hover:scale-110" : "group-hover:scale-110"} ${
                      isActive
                        ? "text-primary rotate-3"
                        : "text-inactive group-hover:text-primary"
                    }`}
                  />
                  {isOpen && (
                    <span className="tracking-tight relative z-10 truncate w-full">
                      {item.label}
                    </span>
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[12px]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 overflow-x-hidden flex flex-col gap-2">
        <button
          className={`flex items-center justify-center ${isOpen ? "gap-4 px-6" : "px-0"} py-4 w-full text-inactive hover:text-white bg-gray-50 hover:bg-primary rounded-2xl text-sm font-black transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 group border border-transparent hover:border-primary/20`}
          onClick={toggleSidebar}
          title={isOpen ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          {isOpen && (
            <span className="whitespace-nowrap">
              {isOpen ? "ย่อแถบเมนู" : "ขยายแถบเมนู"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
