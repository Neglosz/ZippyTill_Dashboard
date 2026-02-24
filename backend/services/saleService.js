const { supabase } = require("../config/supabase");

const saleService = {
  getTopSellingProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select(`*, product_categories (name), order_items (qty, subtotal)`)
      .eq("store_id", branchId).is("deleted_at", null);
    if (prodError) throw prodError;
    if (!products || products.length === 0) return [];
    const processedProducts = products.map((p) => {
      const totalSold = (p.order_items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
      const totalRevenue = (p.order_items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
      return { ...p, sold_qty: totalSold, revenue: totalRevenue };
    });
    return processedProducts.sort((a, b) => b.sold_qty - a.sold_qty).slice(0, 5);
  },

  getProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data, error } = await supabase
      .from("products").select(`*, product_categories (name)`).eq("store_id", branchId).is("deleted_at", null).order("name", { ascending: true });
    if (error) throw error;
    return data;
  },

  getSalesByCategory: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data: products, error: prodError } = await supabase
      .from("products").select(`id, product_categories (id, name), order_items (qty, subtotal)`).eq("store_id", branchId).is("deleted_at", null);
    if (prodError) throw prodError;
    const categoryMap = {};
    products.forEach((p) => {
      const cat = p.product_categories; const catName = cat ? cat.name : "อื่นๆ";
      const totalRevenue = (p.order_items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
      if (!categoryMap[catName]) categoryMap[catName] = { name: catName, revenue: 0 };
      categoryMap[catName].revenue += totalRevenue;
    });
    const sortedCategories = Object.values(categoryMap).filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);
    if (sortedCategories.length > 3) {
      const top3 = sortedCategories.slice(0, 3); const others = sortedCategories.slice(3);
      const othersRevenue = others.reduce((sum, c) => sum + c.revenue, 0);
      const existingOthersIndex = top3.findIndex((c) => c.name === "อื่นๆ");
      if (existingOthersIndex !== -1) { top3[existingOthersIndex].revenue += othersRevenue; return top3; }
      else return [...top3, { name: "อื่นๆ", revenue: othersRevenue }];
    }
    return sortedCategories;
  },

  getSalesSummary: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data: products, error: prodError } = await supabase.from("products").select("stock_qty").eq("store_id", branchId).is("deleted_at", null);
    if (prodError) throw prodError;
    const totalStock = (products || []).reduce((sum, p) => sum + (p.stock_qty || 0), 0);
    const { data: items, error: itemsError } = await supabase.from("order_items").select(`qty, orders!inner(store_id)`).eq("orders.store_id", branchId);
    if (itemsError) throw itemsError;
    const totalSold = (items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
    return { totalProducts: totalStock || 0, totalSold };
  },

  getDashboardMetrics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data: orders, error: ordersError } = await supabase.from("orders").select("total_amount").eq("store_id", branchId);
    if (ordersError) throw ordersError;
    const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrders = (orders || []).length;
    const { data: items, error: itemsError } = await supabase.from("order_items").select("qty, orders!inner(store_id)").eq("orders.store_id", branchId);
    if (itemsError) throw itemsError;
    const totalSold = (items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
    return { totalRevenue, totalOrders, totalSold };
  },

  getWeeklyAnalytics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const now = new Date(); const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(now.getDate() - 14);
    const { data: orders, error } = await supabase.from("orders").select("total_amount, created_at").eq("store_id", branchId).gte("created_at", fourteenDaysAgo.toISOString());
    if (error) throw error;
    const dailyData = {};
    for (let i = 0; i < 14; i++) {
      const date = new Date(now); date.setDate(now.getDate() - i); const dateStr = date.toISOString().split("T")[0]; dailyData[dateStr] = 0;
    }
    (orders || []).forEach((o) => {
      const dateStr = new Date(o.created_at).toISOString().split("T")[0];
      if (dailyData[dateStr] !== undefined) dailyData[dateStr] += o.total_amount || 0;
    });
    const days = Object.keys(dailyData).sort().reverse();
    const currentWeekSales = []; let currentWeekTotal = 0; let previousWeekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = days[i]; const sales = dailyData[dateStr] || 0;
      currentWeekSales.push({ day: new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" })[0], value: sales });
      currentWeekTotal += sales;
    }
    for (let i = 7; i < 14; i++) previousWeekTotal += dailyData[days[i]] || 0;
    let growth = previousWeekTotal > 0 ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100 : currentWeekTotal > 0 ? 100 : 0;
    return { chartData: currentWeekSales.reverse(), growth: Math.round(growth * 10) / 10, totalWeekRevenue: currentWeekTotal };
  },

  getFinanceStats: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data: orders, error: ordersError } = await supabase.from("orders").select("total_amount, created_at, payment_method").eq("store_id", branchId);
    if (ordersError) throw ordersError;
    const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const { data: items, error: itemsError } = await supabase.from("order_items").select(`qty, products (cost_price), orders!inner (store_id)`).eq("orders.store_id", branchId);
    if (itemsError) throw itemsError;
    const totalExpense = (items || []).reduce((sum, item) => sum + (item.products?.cost_price || 0) * (item.qty || 0), 0);
    const paymentStats = {};
    (orders || []).forEach((o) => { const method = o.payment_method || "Other"; paymentStats[method] = (paymentStats[method] || 0) + o.total_amount; });
    const paymentChannels = Object.keys(paymentStats).map((method) => ({ method, amount: paymentStats[method], percent: totalRevenue > 0 ? Math.round((paymentStats[method] / totalRevenue) * 100) : 0 }));
    return { totalRevenue, totalExpense, netProfit: totalRevenue - totalExpense, paymentChannels };
  },

  getDailyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const today = new Date(); const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString(); const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    const { data: orders, error: ordersError } = await supabase.from("orders").select("total_amount, created_at").eq("store_id", branchId).gte("created_at", startOfDay).lte("created_at", endOfDay);
    if (ordersError) throw ordersError;
    const { data: items, error: itemsError } = await supabase.from("order_items").select(`qty, created_at, products (cost_price), orders!inner (store_id)`).eq("orders.store_id", branchId).gte("created_at", startOfDay).lte("created_at", endOfDay);
    if (itemsError) throw itemsError;
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ name: i.toString().padStart(2, "0"), income: 0, expense: 0 }));
    orders.forEach((o) => { hourlyData[new Date(o.created_at).getHours()].income += o.total_amount || 0; });
    items.forEach((item) => { hourlyData[new Date(item.created_at).getHours()].expense += (item.products?.cost_price || 0) * (item.qty || 0); });
    return hourlyData;
  },

  getMonthlyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const year = new Date().getFullYear(); const startOfYear = new Date(year, 0, 1).toISOString();
    const { data: orders, error: ordersError } = await supabase.from("orders").select("total_amount, created_at").eq("store_id", branchId).gte("created_at", startOfYear);
    if (ordersError) throw ordersError;
    const { data: items, error: itemsError } = await supabase.from("order_items").select(`qty, created_at, products (cost_price), orders!inner (store_id)`).eq("orders.store_id", branchId).gte("created_at", startOfYear);
    if (itemsError) throw itemsError;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((m) => ({ name: m, รายรับ: 0, รายจ่าย: 0 }));
    orders.forEach((o) => { monthlyData[new Date(o.created_at).getMonth()].รายรับ += o.total_amount || 0; });
    items.forEach((item) => { monthlyData[new Date(item.created_at).getMonth()].รายจ่าย += (item.products?.cost_price || 0) * (item.qty || 0); });
    return monthlyData;
  },

  getSalesHistory: async (branchId, timeRange) => {
    if (!branchId) throw new Error("Branch ID is required");
    const now = new Date(); let startDate; let groupBy = "day";
    switch (timeRange) {
      case "1D": startDate = new Date(now); startDate.setHours(0, 0, 0, 0); groupBy = "hour"; break;
      case "1W": startDate = new Date(now); startDate.setDate(now.getDate() - 7); groupBy = "day"; break;
      case "1M": startDate = new Date(now); startDate.setDate(now.getDate() - 30); groupBy = "day"; break;
      case "1Y": case "Max": startDate = new Date(now.getFullYear(), 0, 1); groupBy = "month"; break;
      default: startDate = new Date(now); startDate.setHours(0, 0, 0, 0); groupBy = "hour";
    }
    const { data: orders, error } = await supabase.from("orders").select("total_amount, created_at").eq("store_id", branchId).gte("created_at", startDate.toISOString()).order("created_at", { ascending: true });
    if (error) throw error;
    const historyData = [];
    if (groupBy === "hour") {
      const hourlyMap = {}; for (let i = 0; i < 24; i++) hourlyMap[`${i.toString().padStart(2, "0")}:00`] = 0;
      (orders || []).forEach((o) => { hourlyMap[`${new Date(o.created_at).getHours().toString().padStart(2, "0")}:00`] += o.total_amount || 0; });
      Object.keys(hourlyMap).forEach((name) => historyData.push({ name, totalSales: hourlyMap[name] }));
    } else if (groupBy === "day") {
      const dailyMap = {}; const daysToFetch = timeRange === "1W" ? 7 : 30;
      for (let i = daysToFetch - 1; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const label = d.toISOString().split("T")[0]; dailyMap[label] = { label: d.getDate().toString(), value: 0 }; }
      (orders || []).forEach((o) => { const label = new Date(o.created_at).toISOString().split("T")[0]; if (dailyMap[label]) dailyMap[label].value += o.total_amount || 0; });
      Object.keys(dailyMap).sort().forEach((key) => historyData.push({ name: dailyMap[key].label, totalSales: dailyMap[key].value, fullDate: key }));
    } else if (groupBy === "month") {
      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const monthlyMap = {}; months.forEach((m) => (monthlyMap[m] = 0));
      (orders || []).forEach((o) => { monthlyMap[months[new Date(o.created_at).getMonth()]] += o.total_amount || 0; });
      months.forEach((name) => historyData.push({ name, totalSales: monthlyMap[name] }));
    }
    return historyData;
  },
};

module.exports = saleService;
