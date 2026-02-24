const { supabase } = require("../config/supabase");

const storeService = {
  async getUserStores(userId) {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      userId = user.id;
    }
    const { data: ownedStores, error: ownedError } = await supabase.from("stores").select("*").eq("owner_id", userId);
    if (ownedError) throw ownedError;
    const { data: membershipData, error: memberError } = await supabase.from("store_members").select(`store_id, role, stores (*)`).eq("user_id", userId);
    if (memberError) throw memberError;
    const memberStores = membershipData.map((m) => ({ ...m.stores, role: m.role }));
    const allStores = [...ownedStores.map((s) => ({ ...s, role: "owner" }))];
    memberStores.forEach((ms) => { if (!allStores.find((s) => s.id === ms.id)) allStores.push(ms); });
    allStores.sort((a, b) => (b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0) - (a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0));
    return allStores;
  },

  async getStoresSummary(storeIds) {
    if (!storeIds || storeIds.length === 0) return null;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0); const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const { data: orders } = await supabase.from("orders").select("id, total_amount, store_id").in("store_id", storeIds).eq("payment_status", "paid").gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString());
    const totalSales = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const { count: totalOrders } = await supabase.from("orders").select("id", { count: "exact", head: true }).in("store_id", storeIds).neq("payment_status", "cancelled");
    const { data: members } = await supabase.from("store_members").select("id").in("store_id", storeIds);
    return { totalSales, totalOrders, totalStaff: (members || []).length };
  },

  async getStoreStats(storeId) {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0); const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1); const yesterdayEnd = new Date(todayStart); yesterdayEnd.setMilliseconds(-1);
    const { data: todayOrders } = await supabase.from("orders").select("id, total_amount").eq("store_id", storeId).eq("payment_status", "paid").gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString());
    const { data: yesterdayOrders } = await supabase.from("orders").select("total_amount").eq("store_id", storeId).eq("payment_status", "paid").gte("created_at", yesterdayStart.toISOString()).lte("created_at", yesterdayEnd.toISOString());
    const { data: members } = await supabase.from("store_members").select("id").eq("store_id", storeId);
    const salesToday = (todayOrders || []).reduce((s, o) => s + (o.total_amount || 0), 0);
    const salesYesterday = (yesterdayOrders || []).reduce((s, o) => s + (o.total_amount || 0), 0);
    const growth = salesYesterday > 0 ? Math.round(((salesToday - salesYesterday) / salesYesterday) * 100) : salesToday > 0 ? 100 : 0;
    return { salesToday, ordersToday: (todayOrders || []).length, staffCount: (members || []).length, growth };
  },

  async updateLastAccessed(storeId) {
    if (!storeId) return;
    try { await supabase.from("stores").update({ last_accessed_at: new Date().toISOString() }).eq("id", storeId); } catch (err) {}
  },
};

module.exports = storeService;
