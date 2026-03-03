const { supabase } = require("./config/supabase");

async function debug() {
    // 1. Get all stores first
    const { data: stores } = await supabase.from("stores").select("id, name").limit(5);
    console.log("Stores:", JSON.stringify(stores, null, 2));

    if (!stores || stores.length === 0) return;

    // Use first store for testing
    const branchId = stores[0].id;
    console.log("\nUsing branchId:", branchId);

    // 2. Show today's datetime in different timezones
    const now = new Date();
    const thaiFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" });
    const thaiTodayStr = thaiFormatter.format(now);
    const todayStartUTC = new Date(`${thaiTodayStr}T00:00:00+07:00`).toISOString();
    const todayEndUTC = new Date(`${thaiTodayStr}T23:59:59.999+07:00`).toISOString();

    console.log("\nnow (UTC):", now.toISOString());
    console.log("thaiTodayStr:", thaiTodayStr);
    console.log("todayStartUTC:", todayStartUTC);
    console.log("todayEndUTC:", todayEndUTC);

    // 3. Query last 5 orders (any status) to see their created_at
    const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, store_id, total_amount, created_at, payment_status")
        .eq("store_id", branchId)
        .order("created_at", { ascending: false })
        .limit(5);

    console.log("\nLast 5 orders (any status):", JSON.stringify(recentOrders, null, 2));

    // 4. Query today's orders with filter
    const { data: todayOrders, error } = await supabase
        .from("orders")
        .select("id, total_amount, created_at, payment_status")
        .eq("store_id", branchId)
        .neq("payment_status", "cancelled")
        .gte("created_at", todayStartUTC)
        .lte("created_at", todayEndUTC);

    console.log("\nToday's orders (filtered):", JSON.stringify(todayOrders, null, 2));
    console.log("Error:", error);

    const todayRevenue = (todayOrders || []).reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    console.log("\ntodayRevenue =", todayRevenue);
}

debug().catch(console.error);
