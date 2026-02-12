import { supabase } from "../lib/supabase";

export const saleService = {
  // Get top selling products with real sales data from order_items
  getTopSellingProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      console.log(`Fetching top selling products for store_id: ${branchId}`);

      // Fetch from 'products' (using the pluralized/standard table name)
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select(
          `
                    *,
                    product_categories (name),
                    order_items (qty, subtotal)
                `,
        )
        .eq("store_id", branchId);

      if (prodError) throw prodError;

      if (!products || products.length === 0) return [];

      // Process data to calculate totals
      const processedProducts = products.map((p) => {
        const totalSold = (p.order_items || []).reduce(
          (sum, item) => sum + (item.qty || 0),
          0,
        );
        const totalRevenue = (p.order_items || []).reduce(
          (sum, item) => sum + (item.subtotal || 0),
          0,
        );
        return {
          ...p,
          sold_qty: totalSold,
          revenue: totalRevenue,
        };
      });

      // Sort by sold quantity and take top 5
      return processedProducts
        .sort((a, b) => b.sold_qty - a.sold_qty)
        .slice(0, 5);
    } catch (error) {
      console.error("saleService getTopSellingProducts error:", error);
      throw error;
    }
  },

  getProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_categories (name)`)
        .eq("store_id", branchId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("saleService getProducts error:", error);
      throw error;
    }
  },

  getSalesByCategory: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select(
          `
                    id,
                    product_categories (id, name),
                    order_items (qty, subtotal)
                `,
        )
        .eq("store_id", branchId);

      if (prodError) throw prodError;

      const categoryMap = {};

      products.forEach((p) => {
        const cat = p.product_categories;
        const catName = cat ? cat.name : "อื่นๆ";
        const totalRevenue = (p.order_items || []).reduce(
          (sum, item) => sum + (item.subtotal || 0),
          0,
        );

        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, revenue: 0 };
        }
        categoryMap[catName].revenue += totalRevenue;
      });

      // Filter categories with revenue and sort by revenue descending
      const sortedCategories = Object.values(categoryMap)
        .filter((c) => c.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);

      // If more than 3 categories, group the rest into "อื่นๆ"
      if (sortedCategories.length > 3) {
        const top3 = sortedCategories.slice(0, 3);
        const others = sortedCategories.slice(3);
        const othersRevenue = others.reduce((sum, c) => sum + c.revenue, 0);

        // Check if "อื่นๆ" already exists in top3 (unlikely but possible if null category was a top seller)
        const existingOthersIndex = top3.findIndex((c) => c.name === "อื่นๆ");
        if (existingOthersIndex !== -1) {
          top3[existingOthersIndex].revenue += othersRevenue;
          return top3;
        } else {
          return [...top3, { name: "อื่นๆ", revenue: othersRevenue }];
        }
      }

      return sortedCategories;
    } catch (error) {
      console.error("saleService getSalesByCategory error:", error);
      throw error;
    }
  },

  getSalesSummary: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      // 1. Get total stock count for this branch
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("stock_qty")
        .eq("store_id", branchId);

      if (prodError) throw prodError;

      const totalStock = (products || []).reduce(
        (sum, p) => sum + (p.stock_qty || 0),
        0,
      );

      // 2. Get Total Product Sold (sum of qty in order_items) - Filtered by branch via orders/order_items association
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
                    qty,
                    orders!inner(store_id)
                `,
        )
        .eq("orders.store_id", branchId);

      if (itemsError) throw itemsError;

      const totalSold = (items || []).reduce(
        (sum, item) => sum + (item.qty || 0),
        0,
      );

      return {
        totalProducts: totalStock || 0,
        totalSold: totalSold,
      };
    } catch (error) {
      console.error("saleService getSalesSummary error:", error);
      throw error;
    }
  },

  // New function for Dashboard Metrics
  getDashboardMetrics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      // 1. Total Revenue and Total Orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("store_id", branchId);

      if (ordersError) throw ordersError;

      const totalRevenue = (orders || []).reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0,
      );
      const totalOrders = (orders || []).length;

      // 2. Total Products Sold
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("qty, orders!inner(store_id)")
        .eq("orders.store_id", branchId);

      if (itemsError) throw itemsError;

      const totalSold = (items || []).reduce(
        (sum, item) => sum + (item.qty || 0),
        0,
      );

      return {
        totalRevenue,
        totalOrders,
        totalSold,
      };
    } catch (error) {
      console.error("saleService getDashboardMetrics error:", error);
      throw error;
    }
  },

  getWeeklyAnalytics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const now = new Date();
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(now.getDate() - 14);

      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("store_id", branchId)
        .gte("created_at", fourteenDaysAgo.toISOString());

      if (error) throw error;

      // Initialize daily sales for the last 14 days
      const dailyData = {};
      for (let i = 0; i < 14; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dailyData[dateStr] = 0;
      }

      // Group orders by date
      (orders || []).forEach((o) => {
        const dateStr = new Date(o.created_at).toISOString().split("T")[0];
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += o.total_amount || 0;
        }
      });

      // Calculate Current Week (0-6 days ago) and Previous Week (7-13 days ago)
      const days = Object.keys(dailyData).sort().reverse();
      const currentWeekSales = [];
      let currentWeekTotal = 0;
      let previousWeekTotal = 0;

      for (let i = 0; i < 7; i++) {
        const dateStr = days[i];
        const sales = dailyData[dateStr] || 0;
        currentWeekSales.push({
          day: new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
          })[0],
          value: sales,
        });
        currentWeekTotal += sales;
      }

      for (let i = 7; i < 14; i++) {
        const dateStr = days[i];
        previousWeekTotal += dailyData[dateStr] || 0;
      }

      // Calculate growth percentage
      let growth = 0;
      if (previousWeekTotal > 0) {
        growth =
          ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
      } else if (currentWeekTotal > 0) {
        growth = 100;
      }

      return {
        chartData: currentWeekSales.reverse(), // Mon to Sun order
        growth: Math.round(growth * 10) / 10,
        totalWeekRevenue: currentWeekTotal,
      };
    } catch (error) {
      console.error("saleService getWeeklyAnalytics error:", error);
      throw error;
    }
  },

  // Finance Page: Key Metrics (Net Profit, Revenue, Expense)
  getFinanceStats: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      // 1. Total Revenue (from orders)
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, created_at, payment_method")
        .eq("store_id", branchId);

      if (ordersError) throw ordersError;

      const totalRevenue = (orders || []).reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0,
      );

      // 2. Total Expense (COGS) -> sum(qty * cost_price)
      // We need to fetch order_items and their associated product cost
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          qty,
          products (cost_price),
          orders!inner (store_id)
        `,
        )
        .eq("orders.store_id", branchId);

      if (itemsError) throw itemsError;

      const totalExpense = (items || []).reduce((sum, item) => {
        const cost = item.products?.cost_price || 0;
        const qty = item.qty || 0;
        return sum + cost * qty;
      }, 0);

      // 3. Net Profit
      const netProfit = totalRevenue - totalExpense;

      // 4. Payment Method Stats
      const paymentStats = {};
      (orders || []).forEach((o) => {
        const method = o.payment_method || "Other";
        paymentStats[method] = (paymentStats[method] || 0) + o.total_amount;
      });

      // Calculate percentages for payment methods
      const paymentChannels = Object.keys(paymentStats).map((method) => {
        const amount = paymentStats[method];
        return {
          method,
          amount,
          percent:
            totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
        };
      });

      return {
        totalRevenue,
        totalExpense,
        netProfit,
        paymentChannels,
      };
    } catch (error) {
      console.error("saleService getFinanceStats error:", error);
      throw error;
    }
  },

  // Finance Page: Daily Cash Flow Graph (Income vs Expense)
  getDailyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Fetch orders today for Income
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("store_id", branchId)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      if (ordersError) throw ordersError;

      // Fetch order items today for Expense (COGS)
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          qty,
          created_at,
          products (cost_price),
          orders!inner (store_id)
        `,
        )
        .eq("orders.store_id", branchId)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      if (itemsError) throw itemsError;

      // Group by hour (00-23)
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        name: i.toString().padStart(2, "0"),
        income: 0,
        expense: 0,
      }));

      orders.forEach((o) => {
        const hour = new Date(o.created_at).getHours();
        hourlyData[hour].income += o.total_amount || 0;
      });

      items.forEach((item) => {
        const hour = new Date(item.created_at).getHours();
        const cost = (item.products?.cost_price || 0) * (item.qty || 0);
        hourlyData[hour].expense += cost;
      });

      return hourlyData;
    } catch (error) {
      console.error("saleService getDailyFinance error:", error);
      throw error;
    }
  },

  // Finance Page: Monthly Summary (Bar Chart)
  getMonthlyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    try {
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1).toISOString();

      // Fetch all orders this year
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("store_id", branchId)
        .gte("created_at", startOfYear);

      if (ordersError) throw ordersError;

      // Fetch all items this year
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          qty,
          created_at,
          products (cost_price),
          orders!inner (store_id)
        `,
        )
        .eq("orders.store_id", branchId)
        .gte("created_at", startOfYear);

      if (itemsError) throw itemsError;

      // Initialize monthly buckets (Jan-Dec)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthlyData = months.map((m) => ({
        name: m,
        รายรับ: 0,
        รายจ่าย: 0,
      }));

      orders.forEach((o) => {
        const monthIndex = new Date(o.created_at).getMonth();
        monthlyData[monthIndex].รายรับ += o.total_amount || 0;
      });

      items.forEach((item) => {
        const monthIndex = new Date(item.created_at).getMonth();
        const cost = (item.products?.cost_price || 0) * (item.qty || 0);
        monthlyData[monthIndex].รายจ่าย += cost;
      });

      // Return only up to current month or all? Let's return all.
      return monthlyData;
    } catch (error) {
      console.error("saleService getMonthlyFinance error:", error);
      throw error;
    }
  },
};
