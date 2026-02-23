import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Users, Bell, ChevronDown, Store } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "../ProfileDropdown";
import { supabase } from "../../lib/supabase";
import { useBranch } from "../../contexts/BranchContext";
import { productService } from "../../services/productService";
import { creditService } from "../../services/creditService";

const Header = () => {
  const location = useLocation();
  const { activeBranchId, activeBranchName } = useBranch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Read notification settings from localStorage (per branch)
  const getNotificationSettings = () => {
    const notifEnabled = localStorage.getItem(`setting_notifications_${activeBranchId}`);
    const stockEnabled = localStorage.getItem(`setting_stockAlert_${activeBranchId}`);
    return {
      notifications: notifEnabled !== null ? JSON.parse(notifEnabled) : true,
      stockAlert: stockEnabled !== null ? JSON.parse(stockEnabled) : true,
    };
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!activeBranchId) return;

    const settings = getNotificationSettings();

    // If all notifications are disabled, show nothing
    if (!settings.notifications) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch system notifications (Overdue & Expiring)
      const [overdueItems, dashboardNotifs] = await Promise.all([
        creditService.getOverdueItems(activeBranchId),
        productService.getDashboardNotifications(activeBranchId),
      ]);

      // Transform Overdue Items
      const overdueNotifications = overdueItems.map((item) => ({
        id: `overdue-${item.id}`,
        type: "overdue",
        title: `Overdue Payment: ${item.name}`,
        message: `${item.amount.toLocaleString()} THB due on ${new Date(
          item.dueDate,
        ).toLocaleDateString("th-TH")}`,
        time: `${item.overdueDays} days overdue`,
        created_at: item.dueDate, // Sort by due date
        link: "/finance/overdue", // Potential future use
      }));

      // Transform Expiring Items (only if stockAlert is enabled)
      const expiringNotifications = settings.stockAlert
        ? [
            ...dashboardNotifs.expired.map((item) => ({
              id: `expired-${item.name}-${Math.random()}`, // Ensure unique ID
              type: "alert", // Use alert for expired
              title: `Expired: ${item.name}`,
              message: `Product expired on ${item.expiryDate}`,
              time: "Expired",
              created_at: new Date().toISOString(),
            })),
            ...dashboardNotifs.expiringSoon.map((item) => ({
              id: `expiring-${item.name}-${Math.random()}`,
              type: "expiring",
              title: `Expiring Soon: ${item.name}`,
              message: `Expires in ${item.days} days (${item.expiryDate})`,
              time: `${item.days} days left`,
              created_at: new Date().toISOString(),
            })),
            ...(settings.stockAlert
              ? dashboardNotifs.lowStock.map((item) => ({
                  id: `lowstock-${item.name}-${Math.random()}`,
                  type: "stock",
                  title: `Low Stock: ${item.name}`,
                  message: `Only ${item.remaining} left in stock`,
                  time: "Low stock",
                  created_at: new Date().toISOString(),
                }))
              : []),
          ]
        : [];

      // 2. Fetch manual notifications from Supabase
      const { data: manualNotifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("store_id", activeBranchId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 3. Merge and Sort
      const allNotifications = [
        ...overdueNotifications,
        ...expiringNotifications,
        ...(manualNotifications || []),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(allNotifications);
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

    // Listen for settings changes from SettingPage
    const handleStorageChange = (e) => {
      if (e.key?.startsWith("setting_notifications_") || e.key?.startsWith("setting_stockAlert_")) {
        fetchNotifications();
      }
    };
    const handleSettingsChanged = () => {
      fetchNotifications();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("settingsChanged", handleSettingsChanged);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("settingsChanged", handleSettingsChanged);
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

  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user for header:", error);
      }
    };
    fetchUser();
  }, []);

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

  const getUserDisplayName = () => {
    if (!currentUser) return "User";
    return (
      currentUser.user_metadata?.full_name || currentUser.email.split("@")[0]
    );
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

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

        {/* Branch Indicator Tag */}
        {activeBranchName && (
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-orange-50/50 border border-orange-100/80 rounded-xl shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-inner border border-orange-100/50 text-primary">
              <Store size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-0.5">
                สาขาปัจจุบัน
              </p>
              <p className="text-sm font-black text-gray-800 leading-none">
                {activeBranchName}
              </p>
            </div>
          </div>
        )}

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
              {getUserInitials()}
            </div>
            <div className="text-left hidden md:block">
              <p
                className={`text-xs font-bold leading-none ${showProfile ? "text-white" : "text-gray-900"}`}
              >
                {getUserDisplayName()}
              </p>
              <p
                className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${showProfile ? "text-white/70" : "text-inactive"}`}
              >
                {currentUser?.user_metadata?.role || "ผู้ใช้งาน"}
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
            user={currentUser}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
