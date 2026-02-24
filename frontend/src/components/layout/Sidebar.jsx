import React from "react";
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
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    try {
      await authService.logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout Error:", err);
      // Even if logout fails, navigate to login page for safety
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="w-[240px] bg-white border-r border-gray-100 shadow-elevation flex flex-col justify-between shrink-0 h-screen sticky top-0 z-[30] relative group/sidebar">
      {/* Edge lighting effect - High Dimension */}

      <div>
        <div className="p-8 pb-10 flex items-center justify-center group/logo cursor-pointer">
          <div className="relative">
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter group-hover/logo:text-primary transition-colors duration-500">
              ZIPPY TILL
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-0 group-hover/logo:w-full transition-all duration-700 ease-out" />
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-2.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              replace
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-[12px] text-sm font-bold transition-all duration-300 group relative ${
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-inactive hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 3 : 2}
                    className={`transition-all duration-500 group-hover:scale-110 ${
                      isActive
                        ? "text-primary rotate-3"
                        : "text-inactive group-hover:text-primary"
                    }`}
                  />
                  <span className="tracking-tight relative z-10">
                    {item.label}
                  </span>
                  {!isActive && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <button
          className="flex items-center gap-4 px-6 py-4 w-full text-inactive hover:text-white bg-gray-50 hover:bg-primary rounded-2xl text-sm font-black transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 group border border-transparent hover:border-primary/20"
          onClick={handleSignOut}
        >
          <LogOut
            size={20}
            strokeWidth={2.5}
            className="group-hover:-translate-x-1 transition-transform duration-300"
          />
          <span className="tracking-tight">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
