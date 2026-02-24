import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { productService } from "../services/productService";
import { creditService } from "../services/creditService";

/**
 * Custom hook to manage notifications logic for a specific branch.
 * Handles fetching, realtime subscriptions, and deletion.
 * @param {string} activeBranchId
 * @returns {Object} Notification states and actions
 */
export const useNotifications = (activeBranchId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Read notification settings from localStorage (per branch)
  const getNotificationSettings = useCallback(() => {
    const notifEnabled = localStorage.getItem(
      `setting_notifications_${activeBranchId}`,
    );
    const stockEnabled = localStorage.getItem(
      `setting_stockAlert_${activeBranchId}`,
    );
    return {
      notifications: notifEnabled !== null ? JSON.parse(notifEnabled) : true,
      stockAlert: stockEnabled !== null ? JSON.parse(stockEnabled) : true,
    };
  }, [activeBranchId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
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
      const overdueNotifications = overdueItems.map((item) => {
        const rawDate = item.dueDate || item.customerDueDate || item.createdAt;
        const dueDateObj = rawDate ? new Date(rawDate) : null;

        const formattedDate =
          dueDateObj && !isNaN(dueDateObj.getTime())
            ? dueDateObj.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "ไม่ได้ระบุ";

        return {
          id: `overdue-${item.id}`,
          type: "overdue",
          title: `ค้างชำระ: ${item.name}`,
          message: `ยอด ${item.amount.toLocaleString()} บาท\nครบกำหนดเมื่อ ${formattedDate}`,
          time:
            item.overdueDays > 0
              ? `ค้างชำระมาแล้ว ${item.overdueDays} วัน`
              : "ครบกำหนดวันนี้",
          created_at: rawDate || new Date().toISOString(),
          link: "/finance/overdue",
        };
      });

      // Transform Expiring Items (only if stockAlert is enabled)
      const expiringNotifications = settings.stockAlert
        ? [
            ...dashboardNotifs.expired.map((item) => ({
              id: `expired-${item.name}-${Math.random()}`,
              type: "alert",
              title: `สินค้าหมดอายุ: ${item.name}`,
              message: `หมดอายุเมื่อวันที่ ${item.expiryDate}`,
              time: "หมดอายุแล้ว",
              created_at: new Date().toISOString(),
            })),
            ...dashboardNotifs.expiringSoon.map((item) => ({
              id: `expiring-${item.name}-${Math.random()}`,
              type: "expiring",
              title: `สินค้าใกล้หมดอายุ: ${item.name}`,
              message: `จะหมดอายุในอีก ${item.days} วัน\n(วันที่ ${item.expiryDate})`,
              time: `เหลืออีก ${item.days} วัน`,
              created_at: new Date().toISOString(),
            })),
            ...(settings.stockAlert
              ? dashboardNotifs.lowStock.map((item) => ({
                  id: `lowstock-${item.name}-${Math.random()}`,
                  type: "stock",
                  title: `สินค้าใกล้หมด: ${item.name}`,
                  message: `เหลือเพียง ${item.qty} ${item.unit || "ชิ้น"} ในคลัง`,
                  time: "สต็อกน้อย",
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
  }, [activeBranchId, getNotificationSettings]);

  useEffect(() => {
    fetchNotifications();

    if (!activeBranchId) return;

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
      if (
        e.key?.startsWith("setting_notifications_") ||
        e.key?.startsWith("setting_stockAlert_")
      ) {
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
  }, [activeBranchId, fetchNotifications]);

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
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error.message);
    }
  };

  return {
    notifications,
    loading,
    clearAllNotifications,
    deleteNotification,
  };
};
