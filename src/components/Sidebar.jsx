import React from "react";
import { NavLink } from "react-router-dom";
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
    <aside className="w-[200px] bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="p-6 pb-6 flex items-center justify-center">
          <h1 className="text-2xl font-extrabold text-[#1B2559] tracking-wider">
            ZIPPY TILL
          </h1>
        </div>

        <nav className="px-3 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "text-[#6d28d9]"
                    : "text-gray-400 hover:text-[#6d28d9] hover:bg-gray-50"
                }`
              }
            >
              <item.icon
                size={22}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3">
        <button className="flex items-center gap-3 px-4 py-3.5 w-full text-white bg-[#FF6B6B] hover:bg-[#ff5252] rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
