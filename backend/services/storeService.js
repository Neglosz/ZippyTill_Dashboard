const { supabase } = require("../config/supabase");

const storeService = {
  async getUserStores(userId) {
    if (!userId) throw new Error("User ID is required");

    // Get stores where the user is the direct owner
    const { data: ownedStores, error: ownedError } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", userId);
    
    if (ownedError) throw ownedError;

    // Get stores where the user is a member (manager, staff, etc.)
    const { data: membershipData, error: memberError } = await supabase
      .from("store_members")
      .select(`store_id, role, stores (*)`)
      .eq("user_id", userId);
    
    if (memberError) throw memberError;

    const memberStores = membershipData.map((m) => ({ 
      ...m.stores, 
      role: m.role 
    }));

    // Combine and deduplicate
    const allStores = [...ownedStores.map((s) => ({ ...s, role: "owner" }))];
    
    memberStores.forEach((ms) => {
      if (!allStores.find((s) => s.id === ms.id)) {
        allStores.push(ms);
      }
    });

    // Sort by last accessed to show most relevant first
    allStores.sort((a, b) => (b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0) - (a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0));
    
    return allStores;
  },

  async getStoresSummary(storeIds) {
    if (!storeIds || storeIds.length === 0) return null;
    // Use UTC+7 (Asia/Bangkok) explicitly to avoid server timezone issues
    const TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
    const nowUTC = Date.now();
    const nowThai = new Date(nowUTC + TZ_OFFSET_MS);
    const thaiDateStr = nowThai.toISOString().slice(0, 10); // 'YYYY-MM-DD' in Thai time
    const todayStart = new Date(`${thaiDateStr}T00:00:00+07:00`);
    const todayEnd = new Date(`${thaiDateStr}T23:59:59.999+07:00`);
    const { data: orders } = await supabase.from("orders").select("id, total_amount, store_id").in("store_id", storeIds).eq("payment_status", "paid").gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString());
    const totalSales = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const { count: totalOrders } = await supabase.from("orders").select("id", { count: "exact", head: true }).in("store_id", storeIds).neq("payment_status", "cancelled");
    const { data: members } = await supabase.from("store_members").select("id").in("store_id", storeIds);
    return { totalSales, totalOrders, totalStaff: (members || []).length };
  },

  async getStoreStats(storeId) {
    // Use UTC+7 (Asia/Bangkok) explicitly to avoid server timezone issues
    const TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
    const nowUTC = Date.now();
    const nowThai = new Date(nowUTC + TZ_OFFSET_MS);
    const thaiDateStr = nowThai.toISOString().slice(0, 10); // 'YYYY-MM-DD' in Thai time
    const todayStart = new Date(`${thaiDateStr}T00:00:00+07:00`);
    const todayEnd = new Date(`${thaiDateStr}T23:59:59.999+07:00`);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);
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
    try { await supabase.from("stores").update({ last_accessed_at: new Date().toISOString() }).eq("id", storeId); } catch (err) { }
  },

  async updateStore(storeId, updateData, userId) {
    // Permission check: only owner or members with 'manager'/'owner' role can update
    const { data: store, error: fetchError } = await supabase
      .from("stores")
      .select("owner_id")
      .eq("id", storeId)
      .single();

    if (fetchError || !store) throw new Error("Store not found");

    if (store.owner_id !== userId) {
      // Check if user is a manager in store_members
      const { data: member, error: memberError } = await supabase
        .from("store_members")
        .select("role")
        .eq("store_id", storeId)
        .eq("user_id", userId)
        .maybeSingle();

      if (memberError || !member || (member.role !== "owner" && member.role !== "manager")) {
        throw new Error("You do not have permission to update this store");
      }
    }

    const { data, error } = await supabase
      .from("stores")
      .update(updateData)
      .eq("id", storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

module.exports = storeService;
