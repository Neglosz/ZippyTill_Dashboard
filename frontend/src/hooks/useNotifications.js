import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { productService } from "../services/productService";
import { creditService } from "../services/creditService";
import { settingService } from "../services/settingService";
import { notificationService } from "../services/notificationService";

/**
 * Custom hook to manage notifications logic for a specific branch.
 * Handles fetching from persistent backend and realtime updates.
 */
export const useNotifications = (activeBranchId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [settings, setSettings] = useState({
    notifications: true,
    stockAlert: true,
  });

  // Fetch settings from persistent storage
  const fetchSettings = useCallback(async () => {
    if (!activeBranchId) return;
    try {
      const data = await settingService.getSettings(activeBranchId);
      setSettings((prev) => ({
        ...prev,
        notifications:
          data.notifications !== undefined ? data.notifications : true,
        stockAlert: data.stockAlert !== undefined ? data.stockAlert : true,
      }));
    } catch (error) {
      console.warn("Error fetching notification settings from backend:", error);
    }
  }, [activeBranchId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!activeBranchId) return;

    // Check transient settings (loading might not be finished yet)
    if (settings.notifications === false) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch system calculations (Overdue & Dashboard Alerts)
      const [overdueItems, dashboardNotifs, persistentNotifs] =
        await Promise.all([
          creditService.getOverdueItems(activeBranchId),
          productService.getDashboardNotifications(activeBranchId),
          notificationService.getNotifications(activeBranchId),
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
          isRead: false,
        };
      });

      // Transform Expiring Items (computed from stock)
      const expiringNotifications = settings.stockAlert
        ? [
            ...dashboardNotifs.expired.map((item) => ({
              id: `expired-${item.batchId || item.productId || item.name}`,
              type: "alert",
              isRead: false,
              title: `สินค้าหมดอายุ: ${item.name}`,
              message: `หมดอายุเมื่อวันที่ ${item.expiryDate}`,
              time: "หมดอายุแล้ว",
              created_at: new Date().toISOString(),
            })),
            ...dashboardNotifs.expiringSoon.map((item) => ({
              id: `expiring-${item.batchId || item.productId || item.name}`,
              type: "expiring",
              isRead: false,
              title: `สินค้าใกล้หมดอายุ: ${item.name}`,
              message: `จะหมดอายุในอีก ${item.days} วัน\n(วันที่ ${item.expiryDate})`,
              time: `เหลืออีก ${item.days} วัน`,
              created_at: new Date().toISOString(),
            })),
            ...dashboardNotifs.lowStock.map((item) => ({
              id: `lowstock-${item.id || item.productId || item.name}`,
              type: "stock",
              isRead: false,
              title: `สินค้าใกล้หมด: ${item.name}`,
              message: `เหลือเพียง ${item.qty} ${item.unit || "ชิ้น"} ในคลัง`,
              time: "สต็อกน้อย",
              created_at: new Date().toISOString(),
            })),
          ]
        : [];

      // Transform Persistent Notifications
      const formattedPersistent = (persistentNotifs || []).map((n) => ({
        id: n.id,
        type: n.category || n.type || "info",
        title:
          n.title ||
          (n.type === "low_stock" ? "แจ้งเตือนสต็อก" : "แจ้งเตือนระบบ"),
        message: n.message,
        isRead: n.is_read,
        created_at: n.created_at,
        time: new Date(n.created_at).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        actionUrl: n.action_url,
      }));

      // 3. Merge, Filter and Sort
      // Only show UNREAD notifications that haven't been hidden locally in this session
      const allNotifications = [
        ...overdueNotifications,
        ...expiringNotifications,
        ...formattedPersistent,
      ]
        .filter((n) => !n.isRead && !hiddenIds.has(n.id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  }, [
    activeBranchId,
    settings.notifications,
    settings.stockAlert,
    Array.from(hiddenIds).join(","),
  ]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchNotifications();

    if (!activeBranchId) return;

    // Subscribe to realtime changes in persistent table
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

    // Listen for settings changes (Custom Event)
    const handleSettingsChanged = () => {
      fetchSettings().then(() => fetchNotifications());
    };
    window.addEventListener("settingsChanged", handleSettingsChanged);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("settingsChanged", handleSettingsChanged);
    };
  }, [activeBranchId, fetchNotifications, fetchSettings]);

  const clearAllNotifications = async () => {
    if (!activeBranchId) return;
    try {
      // Mark all in DB as read
      await notificationService.markAllAsRead(activeBranchId);

      // Also hide all current ones locally (including computed ones)
      const currentIds = notifications.map((n) => n.id);
      setHiddenIds((prev) => {
        const next = new Set(prev);
        currentIds.forEach((id) => next.add(id));
        return next;
      });

      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error.message);
    }
  };

  const deleteNotification = async (id) => {
    // Hide locally immediately
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // If it's a UUID (persistent), mark in DB as read
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) {
      try {
        await notificationService.markAsRead(id);
      } catch (error) {
        console.error("Error deleting notification:", error.message);
      }
    }
  };

  const markAsRead = async (id) => {
    await deleteNotification(id);
  };

  return {
    notifications,
    loading,
    clearAllNotifications,
    deleteNotification,
    markAsRead,
  };
};
