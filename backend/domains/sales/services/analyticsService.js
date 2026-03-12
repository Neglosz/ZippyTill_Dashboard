const { supabase } = require("../../core/config/supabase");

const analyticsService = {
  async getSalesData(storeId, groupBy) {
    if (!storeId) throw new Error("Store ID is required");

    const now = new Date();
    let startDate, endDate;

    if (groupBy === "day") {
      // Last 24 hours or today
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      endDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    } else if (groupBy === "month") {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    } else if (groupBy === "year") {
      // Current year
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
    } else {
      // Default to day
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      endDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("store_id", storeId)
      .neq("payment_status", "cancelled")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    // Bucketing logic moved from frontend (AIPromotionPage.jsx)
    const buckets = {};

    if (groupBy === "day") {
      // Hour-by-hour
      for (let i = 0; i < 24; i++) {
        buckets[`${i.toString().padStart(2, "0")}:00`] = 0;
      }
      orders.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        const key = `${hour.toString().padStart(2, "0")}:00`;
        buckets[key] += Number(order.total_amount || 0);
      });
    } else if (groupBy === "month") {
      // Day-by-day
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        buckets[i.toString()] = 0;
      }
      orders.forEach(order => {
        const day = new Date(order.created_at).getDate();
        buckets[day.toString()] += Number(order.total_amount || 0);
      });
    } else if (groupBy === "year") {
      // Month-by-month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(m => buckets[m] = 0);
      orders.forEach(order => {
        const monthIndex = new Date(order.created_at).getMonth();
        buckets[months[monthIndex]] += Number(order.total_amount || 0);
      });
    }

    return Object.keys(buckets).map(key => ({
      name: key,
      revenue: buckets[key],
    }));
  }
};

module.exports = analyticsService;
