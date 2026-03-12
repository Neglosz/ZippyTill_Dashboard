const { supabase } = require("../../core/config/supabase");

/**
 * Utility to get current time in Thai Timezone (UTC+7)
 */
const getThaiTime = (date = new Date()) => {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
};

/**
 * Helper to fetch all non-cancelled orders for a branch with pagination
 * bypasses the 1000-row limit of Supabase
 */
const fetchAllOrders = async (branchId, selectStr = "id, total_amount") => {
  let allOrders = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("orders")
      .select(selectStr)
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled")
      .order("id", { ascending: true })
      .limit(1000);

    if (lastId) query = query.gt("id", lastId);

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allOrders = [...allOrders, ...data];
      lastId = data[data.length - 1].id;
      if (data.length < 1000) hasMore = false;
    }
  }
  return allOrders;
};

const saleService = {
  /**
   * Fetch top 5 selling products based on quantity sold
   */
  getTopSellingProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    // 1. Fetch all order items for this store that are NOT cancelled
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        product_id,
        qty,
        subtotal,
        products!inner (
          name,
          image_url,
          price,
          unit_type,
          product_categories (name),
          deleted_at
        ),
        orders!inner (
          payment_status
        )
      `,
      )
      .eq("products.store_id", branchId)
      .is("products.deleted_at", null)
      .neq("orders.payment_status", "cancelled");

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) return [];

    // 2. Aggregate data by product_id
    const productMap = {};
    items.forEach((item) => {
      const productId = item.product_id;
      if (!productMap[productId]) {
        productMap[productId] = {
          id: productId,
          name: item.products.name,
          image_url: item.products.image_url,
          price: item.products.price,
          unit_type: item.products.unit_type,
          category_name: item.products.product_categories?.name || "ทั่วไป",
          sold_qty: 0,
          revenue: 0,
        };
      }
      const qty = parseFloat(item.qty) || 0;
      const itemSubtotal =
        parseFloat(item.subtotal) ||
        qty * (parseFloat(item.products.price) || 0);

      productMap[productId].sold_qty += qty;
      productMap[productId].revenue += itemSubtotal;
    });

    // 3. Convert to array, sort by sold_qty, and take top 5
    return Object.values(productMap)
      .sort((a, b) => b.sold_qty - a.sold_qty)
      .slice(0, 5);
  },

  /**
   * Get all active products for a branch
   */
  getProducts: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_categories (name)`)
      .eq("store_id", branchId)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Calculate revenue grouped by product category with percentages
   */
  getSalesByCategory: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    try {
      // 1. Fetch ALL non-cancelled orders to get their IDs and total revenue
      const allOrders = await fetchAllOrders(branchId, "id, total_amount");
      const orderIds = allOrders.map((o) => o.id);
      const totalRevenue = allOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

      if (orderIds.length === 0) return [];

      // 2. Fetch order items in chunks and group by category
      const categoryMap = {};
      const chunkSize = 200;

      for (let i = 0; i < orderIds.length; i += chunkSize) {
        const chunk = orderIds.slice(i, i + chunkSize);
        const { data: items } = await supabase
          .from("order_items")
          .select(
            `
            subtotal,
            products (
              product_categories (name)
            )
          `,
          )
          .in("order_id", chunk);

        if (items) {
          items.forEach((item) => {
            const categoryName =
              item.products?.product_categories?.name ||
              "หมวดหมู่อื่นๆ / สินค้าที่ลบออก";
            const revenue = parseFloat(item.subtotal) || 0;

            if (!categoryMap[categoryName]) {
              categoryMap[categoryName] = { name: categoryName, revenue: 0 };
            }
            categoryMap[categoryName].revenue += revenue;
          });
        }
      }

      return Object.values(categoryMap)
        .filter((cat) => cat.revenue > 0)
        .map(cat => ({
          ...cat,
          percentage: totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(0) : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error("getSalesByCategory Error:", error);
      return [];
    }
  },


  /**
   * Get overall sales summary including total stock, items sold, and revenue
   */
  getSalesSummary: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    try {
      // 1. Get total stock count
      const { data: products } = await supabase
        .from("products")
        .select("stock_qty")
        .eq("store_id", branchId)
        .is("deleted_at", null);
      
      const totalStock = (products || []).reduce(
        (sum, product) => sum + (parseFloat(product.stock_qty) || 0),
        0,
      );

      // 2. Fetch ALL non-cancelled orders and manual transactions
      const [allOrders, allManualTxns] = await Promise.all([
        fetchAllOrders(branchId, "id, total_amount"),
        supabase
          .from("account_transactions")
          .select("amount, trans_type, category, reference_order_id")
          .eq("store_id", branchId)
      ]);
      
      const totalOrderRevenue = allOrders.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0,
      );

      const totalOtherIncome = (allManualTxns.data || [])
        .filter(t => t.trans_type === "income" && !(t.category === "sales" && t.reference_order_id))
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const totalOtherExpense = (allManualTxns.data || [])
        .filter(t => t.trans_type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      // Total Gross Revenue
      const totalRevenue = totalOrderRevenue + totalOtherIncome;

      // 3. Fetch ALL order items to get total sold qty and verify revenue
      let totalSold = 0;
      let revenueFromItems = 0;

      const orderIds = allOrders.map((o) => o.id);
      const chunkSize = 200;

      for (let i = 0; i < orderIds.length; i += chunkSize) {
        const chunk = orderIds.slice(i, i + chunkSize);
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("qty, subtotal")
          .in("order_id", chunk);

        if (!itemsError && items) {
          items.forEach((item) => {
            totalSold += parseFloat(item.qty) || 0;
            revenueFromItems += parseFloat(item.subtotal) || 0;
          });
        }
      }

      return {
        totalProducts: totalStock || 0,
        totalSold: totalSold || 0,
        totalRevenue: Math.ceil(totalRevenue),
      };
    } catch (error) {
      console.error("getSalesSummary Error:", error);
      return { totalProducts: 0, totalSold: 0, totalRevenue: 0 };
    }
  },

  /**
   * Get main metrics for the dashboard (Today's revenue, total revenue, etc.)
   */
  getDashboardMetrics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    try {
      const now = new Date();
      // Get "today" in Thai time (UTC+7)
      const thaiFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
      });
      const thaiTodayStr = thaiFormatter.format(now); // "YYYY-MM-DD"

      // Today range in ISO for Created At
      const todayStartUTC = new Date(`${thaiTodayStr}T00:00:00+07:00`).toISOString();
      const todayEndUTC = new Date(`${thaiTodayStr}T23:59:59.999+07:00`).toISOString();

      // 1. Today's Data
      const [todayOrders, todayManualTxns] = await Promise.all([
        supabase
          .from("orders")
          .select("total_amount")
          .eq("store_id", branchId)
          .neq("payment_status", "cancelled")
          .gte("created_at", todayStartUTC)
          .lte("created_at", todayEndUTC),
        supabase
          .from("account_transactions")
          .select("amount, trans_type, category, reference_order_id")
          .eq("store_id", branchId)
          .eq("trans_date", thaiTodayStr)
      ]);

      const todayOrderRevenue = (todayOrders.data || []).reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0,
      );

      const todayOtherIncome = (todayManualTxns.data || [])
        .filter(t => t.trans_type === "income" && !(t.category === "sales" && t.reference_order_id))
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const todayOtherExpense = (todayManualTxns.data || [])
        .filter(t => t.trans_type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      // Today's Gross Revenue
      const todayRevenue = todayOrderRevenue + todayOtherIncome;

      // 2. All-time revenue & orders
      const [allOrders, allManualTxns] = await Promise.all([
        fetchAllOrders(branchId, "id, total_amount"),
        supabase
          .from("account_transactions")
          .select("amount, trans_type, category, reference_order_id")
          .eq("store_id", branchId)
      ]);
      
      const totalOrderRevenue = allOrders.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0,
      );

      const totalOtherIncome = (allManualTxns.data || [])
        .filter(t => t.trans_type === "income" && !(t.category === "sales" && t.reference_order_id))
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const totalOtherExpense = (allManualTxns.data || [])
        .filter(t => t.trans_type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const totalRevenue = totalOrderRevenue + totalOtherIncome;

      // 3. Total items sold
      let totalSold = 0;
      const orderIds = allOrders.map((o) => o.id);
      const chunkSize = 200;

      for (let i = 0; i < orderIds.length; i += chunkSize) {
        const chunk = orderIds.slice(i, i + chunkSize);
        const { data: items } = await supabase
          .from("order_items")
          .select("qty")
          .in("order_id", chunk);

        if (items) {
          items.forEach((item) => {
            totalSold += parseFloat(item.qty) || 0;
          });
        }
      }

      // 4. Total stock count
      const { data: products } = await supabase
        .from("products")
        .select("stock_qty")
        .eq("store_id", branchId)
        .is("deleted_at", null);
      
      const totalProductsCount = (products || []).reduce(
        (sum, product) => sum + (parseFloat(product.stock_qty) || 0),
        0,
      );

      return {
        totalRevenue,
        todayRevenue,
        totalOrders: allOrders.length,
        totalSold,
        totalProducts: totalProductsCount,
      };
    } catch (error) {
      console.error("getDashboardMetrics Error:", error);
      return {
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        totalSold: 0,
        totalProducts: 0,
      };
    }
  },

  /**
   * Weekly analytics for chart (Current week Mon-Sun)
   */
  getWeeklyAnalytics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const now = new Date();
    const thaiNow = getThaiTime(now);
    
    // Find current Monday in Thai timezone
    const currentDay = thaiNow.getUTCDay(); // 0 = Sun, 1 = Mon...
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(thaiNow);
    monday.setUTCDate(thaiNow.getUTCDate() + diff);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    // Convert Thai range back to UTC for query
    const startUTC = new Date(monday.getTime() - (7 * 60 * 60 * 1000)).toISOString();
    const endUTC = new Date(sunday.getTime() - (7 * 60 * 60 * 1000)).toISOString();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled")
      .gte("created_at", startUTC)
      .lte("created_at", endUTC);

    if (error) throw error;

    const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"];
    const orderedLabels = ["จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์", "อาทิตย์"];
    
    const dailyMap = {};
    orderedLabels.forEach(label => dailyMap[label] = 0);

    (orders || []).forEach((order) => {
      const date = new Date(order.created_at);
      const thaiDate = getThaiTime(date);
      const label = thaiDays[thaiDate.getUTCDay()];
      if (dailyMap[label] !== undefined) {
        dailyMap[label] += Number(order.total_amount || 0);
      }
    });

    const chartData = orderedLabels.map(label => ({
      day: label,
      value: dailyMap[label]
    }));

    return {
      chartData,
      growth: 0,
      totalWeekRevenue: chartData.reduce((sum, d) => sum + d.value, 0),
    };
  },

  /**
   * Financial summary including profit and payment channels
   */
  getFinanceStats: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    // 1. Total Revenue and Payment Types
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount, payment_type")
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled");

    if (ordersError) throw ordersError;

    const totalRevenue = (orders || []).reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0,
    );

    // 2. Total Expense (Cost Price * Quantity)
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`qty, products (cost_price), orders!inner (store_id, payment_status)`)
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled");

    if (itemsError) throw itemsError;

    const totalExpense = (items || []).reduce(
      (sum, item) => sum + (item.products?.cost_price || 0) * (item.qty || 0),
      0,
    );

    // 3. Payment Distribution
    const paymentStats = {};
    (orders || []).forEach((order) => {
      const method = order.payment_type || "Other";
      paymentStats[method] = (paymentStats[method] || 0) + (order.total_amount || 0);
    });

    const paymentChannels = Object.keys(paymentStats).map((method) => ({
      method,
      amount: paymentStats[method],
      percent: totalRevenue > 0 ? Math.round((paymentStats[method] / totalRevenue) * 100) : 0,
    }));

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      paymentChannels,
    };
  },

  /**
   * Hourly breakdown for current day
   */
  getDailyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("total_amount, created_at")
        .eq("store_id", branchId).neq("payment_status", "cancelled")
        .gte("created_at", startOfDay).lte("created_at", endOfDay),
      supabase.from("order_items")
        .select(`qty, created_at, products (cost_price), orders!inner (store_id, payment_status)`)
        .eq("orders.store_id", branchId).neq("orders.payment_status", "cancelled")
        .gte("created_at", startOfDay).lte("created_at", endOfDay)
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (itemsRes.error) throw itemsRes.error;

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      income: 0,
      expense: 0,
    }));

    ordersRes.data.forEach((order) => {
      hourlyData[new Date(order.created_at).getHours()].income += order.total_amount || 0;
    });

    itemsRes.data.forEach((item) => {
      hourlyData[new Date(item.created_at).getHours()].expense += (item.products?.cost_price || 0) * (item.qty || 0);
    });

    return hourlyData;
  },

  /**
   * Monthly breakdown for current year
   */
  getMonthlyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1).toISOString();

    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("total_amount, created_at")
        .eq("store_id", branchId).neq("payment_status", "cancelled").gte("created_at", startOfYear),
      supabase.from("order_items")
        .select(`qty, created_at, products (cost_price), orders!inner (store_id, payment_status)`)
        .eq("orders.store_id", branchId).neq("orders.payment_status", "cancelled").gte("created_at", startOfYear)
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (itemsRes.error) throw itemsRes.error;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((m) => ({ name: m, รายรับ: 0, รายจ่าย: 0 }));

    ordersRes.data.forEach((order) => {
      monthlyData[new Date(order.created_at).getMonth()].รายรับ += order.total_amount || 0;
    });

    itemsRes.data.forEach((item) => {
      monthlyData[new Date(item.created_at).getMonth()].รายจ่าย += (item.products?.cost_price || 0) * (item.qty || 0);
    });

    return monthlyData;
  },

  /**
   * Sales history with flexible time range (1D, 1W, 1M, 1Y)
   */
  getSalesHistory: async (branchId, timeRange) => {
    if (!branchId) throw new Error("Branch ID is required");

    const now = new Date();
    let startDate;
    let groupBy = "day";

    switch (timeRange) {
      case "1D":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        groupBy = "hour";
        break;
      case "1W":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupBy = "day";
        break;
      case "1M":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = "day";
        break;
      case "1Y":
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = "month";
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        groupBy = "hour";
    }

    const { data: items, error } = await supabase
      .from("order_items")
      .select(`subtotal, orders!inner (payment_status, created_at)`)
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled")
      .gte("orders.created_at", startDate.toISOString());

    if (error) throw error;

    const historyData = [];
    if (groupBy === "hour") {
      const hourlyMap = {};
      for (let i = 0; i < 24; i++) {
        hourlyMap[`${i.toString().padStart(2, "0")}:00`] = 0;
      }

      (items || []).forEach((item) => {
        const thaiHour = getThaiTime(new Date(item.orders.created_at)).getUTCHours();
        const hourLabel = `${thaiHour.toString().padStart(2, "0")}:00`;
        if (hourlyMap[hourLabel] !== undefined) {
          hourlyMap[hourLabel] += parseFloat(item.subtotal) || 0;
        }
      });

      Object.keys(hourlyMap).sort().forEach((name) => {
        historyData.push({ name, totalSales: Math.ceil(hourlyMap[name]) });
      });
    } else if (groupBy === "day") {
      const dailyMap = {};

      if (timeRange === "1W") {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          const datePart = getThaiTime(date).toISOString().split("T")[0];
          const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
          dailyMap[datePart] = { name: days[date.getDay()], value: 0, fullDate: datePart };
        }
      } else {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(now.getFullYear(), now.getMonth(), i);
          const datePart = getThaiTime(date).toISOString().split("T")[0];
          dailyMap[datePart] = { name: i.toString(), value: 0, fullDate: datePart };
        }
      }

      (items || []).forEach((item) => {
        const datePart = getThaiTime(new Date(item.orders.created_at)).toISOString().split("T")[0];
        if (dailyMap[datePart]) {
          dailyMap[datePart].value += parseFloat(item.subtotal) || 0;
        }
      });

      Object.keys(dailyMap).sort().forEach((key) => {
        historyData.push({
          name: dailyMap[key].name,
          totalSales: Math.ceil(dailyMap[key].value),
          fullDate: dailyMap[key].fullDate,
        });
      });
    } else if (groupBy === "month") {
      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const monthlyMap = {};
      months.forEach((m) => (monthlyMap[m] = 0));

      (items || []).forEach((item) => {
        const thaiMonth = getThaiTime(new Date(item.orders.created_at)).getUTCMonth();
        monthlyMap[months[thaiMonth]] += parseFloat(item.subtotal) || 0;
      });

      months.forEach((name) => {
        historyData.push({ name, totalSales: Math.ceil(monthlyMap[name]) });
      });
    }

    return historyData;
  },
};

module.exports = saleService;
