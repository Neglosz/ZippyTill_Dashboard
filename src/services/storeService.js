import { supabase } from "../lib/supabase";

export const storeService = {
  /**
   * Get all stores where the user is an owner or a member
   * @param {string} userId
   */
  async getUserStores(userId) {
    if (!userId) {
      // If no userId provided, attempt to get it from current session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      userId = user.id;
    }

    // 1. Fetch stores owned by the user
    const { data: ownedStores, error: ownedError } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", userId);

    if (ownedError) throw ownedError;

    // 2. Fetch stores where user is a member
    const { data: membershipData, error: memberError } = await supabase
      .from("store_members")
      .select(
        `
        store_id,
        role,
        stores (*)
      `,
      )
      .eq("user_id", userId);

    if (memberError) throw memberError;

    const memberStores = membershipData.map((m) => ({
      ...m.stores,
      role: m.role,
    }));

    // 3. Combine and remove duplicates (if any)
    const allStores = [...ownedStores.map((s) => ({ ...s, role: "owner" }))];

    memberStores.forEach((ms) => {
      if (!allStores.find((s) => s.id === ms.id)) {
        allStores.push(ms);
      }
    });

    return allStores;
  },

  /**
   * Get aggregate summary statistics across all given stores for today
   * @param {string[]} storeIds
   */
  async getStoresSummary(storeIds) {
    if (!storeIds || storeIds.length === 0) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's paid orders across all stores
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, store_id")
      .in("store_id", storeIds)
      .eq("payment_status", "paid")
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    if (ordersError)
      console.error("getStoresSummary orders error:", ordersError);

    const totalSales = (orders || []).reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0,
    );

    // All-time orders (non-cancelled) → คำสั่งซื้อทั้งหมด
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("store_id", storeIds)
      .neq("payment_status", "cancelled");

    // Staff count (store_members across all stores)
    const { data: members, error: membersError } = await supabase
      .from("store_members")
      .select("id")
      .in("store_id", storeIds);

    if (membersError)
      console.error("getStoresSummary members error:", membersError);

    const totalStaff = (members || []).length;

    return { totalSales, totalOrders, totalStaff };
  },

  /**
   * Get per-store stats for today (sales, orders, staff count, growth vs yesterday)
   * @param {string} storeId
   */
  async getStoreStats(storeId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    yesterdayEnd.setMilliseconds(-1);

    // Today's orders
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("store_id", storeId)
      .eq("payment_status", "paid")
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    // Yesterday's orders (for growth %)
    const { data: yesterdayOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("store_id", storeId)
      .eq("payment_status", "paid")
      .gte("created_at", yesterdayStart.toISOString())
      .lte("created_at", yesterdayEnd.toISOString());

    // Staff count
    const { data: members } = await supabase
      .from("store_members")
      .select("id")
      .eq("store_id", storeId);

    const salesToday = (todayOrders || []).reduce(
      (s, o) => s + (o.total_amount || 0),
      0,
    );
    const ordersToday = (todayOrders || []).length;
    const staffCount = (members || []).length;

    const salesYesterday = (yesterdayOrders || []).reduce(
      (s, o) => s + (o.total_amount || 0),
      0,
    );
    const growth =
      salesYesterday > 0
        ? Math.round(((salesToday - salesYesterday) / salesYesterday) * 100)
        : salesToday > 0
          ? 100
          : 0;

    return { salesToday, ordersToday, staffCount, growth };
  },
};
