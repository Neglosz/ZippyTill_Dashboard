import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Bell, ChevronDown } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "../ProfileDropdown";
import { supabase } from "../../lib/supabase";
import { useBranch } from "../../contexts/BranchContext";

const Header = () => {
  const location = useLocation();
  const { activeBranchId } = useBranch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!activeBranchId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("store_id", activeBranchId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`notifications_${activeBranchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `store_id=eq.${activeBranchId}`,
        },
        () => {
          fetchNotifications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeBranchId]);

  const clearAllNotifications = async () => {
    if (!activeBranchId) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("store_id", activeBranchId);

      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error.message);
    }
  };

  // Dynamic title mapping
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

  const title = getTitle();

  return (
    <header className="h-20 shrink-0 px-8 flex items-center justify-between bg-white shadow-elevation sticky top-0 z-40 relative group/header border-b border-gray-100/50">
      {/* Edge lighting effect - High Dimension */}

      <div className="flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight leading-snug">
          {title}
        </h2>
        <div className="flex items-center gap-2 mt-1.5 opacity-80">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
            Overview & Metrics
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-xl transition-all duration-300 border ${
              showNotifications
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-gray-50 text-inactive hover:text-primary hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            <Bell size={20} className={showNotifications ? "rotate-0" : ""} />
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            )}
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            notifications={notifications}
            loading={loading}
            onClose={() => setShowNotifications(false)}
            onClearAll={clearAllNotifications}
            onDelete={deleteNotification}
          />
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-gray-100 mx-1" />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-300 border ${
              showProfile
                ? "bg-primary text-white border-primary"
                : "bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                showProfile
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              AD
            </div>
            <div className="text-left hidden md:block">
              <p
                className={`text-xs font-bold leading-none ${showProfile ? "text-white" : "text-gray-900"}`}
              >
                Admin
              </p>
              <p
                className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${showProfile ? "text-white/70" : "text-inactive"}`}
              >
                ผู้ดูแลระบบ
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${showProfile ? "rotate-180" : ""}`}
            />
          </button>
          <ProfileDropdown
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
