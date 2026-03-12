import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { productService } from "../services/productService";
import { financeService } from "../services/financeService";
import { settingService } from "../services/settingService";

import { notificationService } from "../services/notificationService";

export const useNotifications = (activeBranchId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const [hiddenIds, setHiddenIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`hiddenNotifs_${activeBranchId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    if (activeBranchId) {
      sessionStorage.setItem(`hiddenNotifs_${activeBranchId}`, JSON.stringify(Array.from(hiddenIds)));
    }
  }, [hiddenIds, activeBranchId]);

  const [settings, setSettings] = useState({ notifications: true, stockAlert: true });

  const fetchSettings = useCallback(async () => {
    if (!activeBranchId) return;
    try {
      const data = await settingService.getSettings(activeBranchId);
      setSettings({
        notifications: data.notifications !== undefined ? data.notifications : true,
        stockAlert: data.stockAlert !== undefined ? data.stockAlert : true,
      });
    } catch (err) {}
  }, [activeBranchId]);

  const fetchNotifications = useCallback(async () => {
    const now = Date.now();
    // HARD LIMIT: No fetching more than once every 5 seconds per hook instance
    if (!activeBranchId || isFetchingRef.current || (now - lastFetchTimeRef.current < 5000)) return;

    try {
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      setLoading(true);

      const [overdueItems, dashboardNotifs, persistentNotifs] = await Promise.all([
        financeService.getOverdueItems(activeBranchId).catch(() => []),
        productService.getDashboardNotifications(activeBranchId).catch(() => ({ expired: [], expiringSoon: [], lowStock: [] })),
        notificationService.getNotifications(activeBranchId).catch(() => [])
      ]);


      const overdueList = (overdueItems || []).map(item => ({
        id: `overdue-${item.id}`,
        type: "overdue",
        title: `ยอดค้าง: ${item.name}`,
        message: `฿${(item.amount || 0).toLocaleString()}`,
        created_at: item.dueDate || new Date().toISOString(),
        isRead: false
      }));

      const stockList = settings.stockAlert ? [
        ...(dashboardNotifs?.expired || []).map(item => ({
          id: `expired-${item.batchId || item.id || item.name}`,
          type: "alert",
          title: `หมดอายุ: ${item.name}`,
          message: item.expiryDate,
          created_at: new Date().toISOString(),
          isRead: false
        })),
        ...(dashboardNotifs?.lowStock || []).map(item => ({
          id: `lowstock-${item.id || item.productId || item.name}`,
          type: "stock",
          title: `สต็อกต่ำ: ${item.name}`,
          message: `${item.qty} ชิ้น`,
          created_at: new Date().toISOString(),
          isRead: false
        }))
      ] : [];

      const persistentList = (persistentNotifs || []).map(n => ({
        id: n.id,
        type: n.type || 'info',
        title: n.title || 'แจ้งเตือนระบบ',
        message: n.message,
        created_at: n.created_at,
        isRead: n.is_read
      }));

      setNotifications([...overdueList, ...stockList, ...persistentList].filter(n => !n.isRead));
    } catch (err) {
      console.error("Fetch Loop Prevented:", err.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [activeBranchId, settings.notifications, settings.stockAlert]);

  const visibleNotifications = useMemo(() => {
    return notifications.filter(n => !hiddenIds.has(n.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [notifications, hiddenIds]);

  useEffect(() => {
    fetchSettings();
    fetchNotifications();
  }, [activeBranchId]); // Only fetch when branch changes

  useEffect(() => {
    if (!activeBranchId) return;
    const channel = supabase.channel(`notif_sync_${activeBranchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `store_id=eq.${activeBranchId}` }, 
      () => fetchNotifications())
      .on("postgres_changes", { event: "*", schema: "public", table: "products", filter: `store_id=eq.${activeBranchId}` }, 
      () => fetchNotifications())
      .on("postgres_changes", { event: "*", schema: "public", table: "product_batches" }, 
      () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeBranchId]); // fetchNotifications removed from deps to break loop

  return {
    notifications: visibleNotifications,
    loading,
    clearAllNotifications: () => {
      const currentIds = notifications.map(n => n.id);
      setHiddenIds(prev => new Set([...prev, ...currentIds]));
    },
    deleteNotification: (id) => {
      setHiddenIds(prev => new Set([...prev, id]));
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        notificationService.markAsRead(id).catch(() => {});
      }
    },
    markAsRead: (id) => setHiddenIds(prev => new Set([...prev, id]))
  };
};
