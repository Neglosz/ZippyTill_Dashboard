const { supabase } = require("../config/supabase");

const saleService = {
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
      const pId = item.product_id;
      if (!productMap[pId]) {
        productMap[pId] = {
          id: pId,
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

      productMap[pId].sold_qty += qty;
      productMap[pId].revenue += itemSubtotal;
    });

    // 3. Convert to array, sort by sold_qty, and take top 5
    return Object.values(productMap)
      .sort((a, b) => b.sold_qty - a.sold_qty)
      .slice(0, 5);
  },

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

  getSalesByCategory: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    try {
      // 1. Fetch ALL non-cancelled orders to get their IDs
      let orderIds = [];
      let lastId = null;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("orders")
          .select("id")
          .eq("store_id", branchId)
          .neq("payment_status", "cancelled")
          .order("id", { ascending: true })
          .limit(1000);
        if (lastId) query = query.gt("id", lastId);
        const { data } = await query;
        if (!data || data.length === 0) hasMore = false;
        else {
          orderIds = [...orderIds, ...data.map((o) => o.id)];
          lastId = data[data.length - 1].id;
          if (data.length < 1000) hasMore = false;
        }
      }

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
            const catName =
              item.products?.product_categories?.name ||
              "หมวดหมู่อื่นๆ / สินค้าที่ลบออก";
            const revenue = parseFloat(item.subtotal) || 0;

            if (!categoryMap[catName]) {
              categoryMap[catName] = { name: catName, revenue: 0 };
            }
            categoryMap[catName].revenue += revenue;
          });
        }
      }

      const sortedCategories = Object.values(categoryMap)
        .filter((c) => c.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);

      return sortedCategories;
    } catch (error) {
      console.error("getSalesByCategory Error:", error);
      return [];
    }
  },

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
        (sum, p) => sum + (parseFloat(p.stock_qty) || 0),
        0,
      );

      // 2. Fetch ALL non-cancelled orders using pagination to bypass 1000-row limit
      let allOrders = [];
      let lastId = null;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("orders")
          .select("id, total_amount")
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

      const revenueFromOrders = allOrders.reduce(
        (sum, o) => sum + (parseFloat(o.total_amount) || 0),
        0,
      );

      // 3. Fetch ALL order items for these orders to get total sold qty and verify revenue
      // We process this in chunks to avoid URL length issues or heavy memory usage
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
        totalRevenue: Math.max(revenueFromOrders, revenueFromItems),
      };
    } catch (error) {
      console.error("getSalesSummary Error:", error);
      return { totalProducts: 0, totalSold: 0, totalRevenue: 0 };
    }
  },

  getDashboardMetrics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    try {
      const now = new Date();
      // Get "today" in Thai time (UTC+7) reliably using Intl, regardless of server timezone.
      const thaiFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
      });
      const thaiTodayStr = thaiFormatter.format(now); // "YYYY-MM-DD"

      // 1. Query today's orders directly from orders table using created_at date range (UTC+7)
      const todayStartUTC = new Date(
        `${thaiTodayStr}T00:00:00+07:00`,
      ).toISOString();
      const todayEndUTC = new Date(
        `${thaiTodayStr}T23:59:59.999+07:00`,
      ).toISOString();

      console.log("[DEBUG getDashboardMetrics] thaiTodayStr:", thaiTodayStr);
      console.log("[DEBUG getDashboardMetrics] todayStartUTC:", todayStartUTC);
      console.log("[DEBUG getDashboardMetrics] todayEndUTC:", todayEndUTC);
      console.log("[DEBUG getDashboardMetrics] branchId:", branchId);

      const { data: todayOrders, error: todayErr } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("store_id", branchId)
        .neq("payment_status", "cancelled")
        .gte("created_at", todayStartUTC)
        .lte("created_at", todayEndUTC);

      console.log("[DEBUG getDashboardMetrics] todayErr:", todayErr);
      console.log(
        "[DEBUG getDashboardMetrics] todayOrders count:",
        todayOrders?.length,
        todayOrders,
      );

      if (todayErr) throw todayErr;

      const todayRevenue = (todayOrders || []).reduce(
        (sum, o) => sum + (parseFloat(o.total_amount) || 0),
        0,
      );

      console.log("[DEBUG getDashboardMetrics] todayRevenue:", todayRevenue);

      // 2. Fetch ALL non-cancelled orders (paginated) for totalRevenue
      let allOrders = [];
      let lastId = null;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("orders")
          .select("id, total_amount")
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

      const totalRevenue = allOrders.reduce(
        (sum, o) => sum + (parseFloat(o.total_amount) || 0),
        0,
      );

      // 3. Fetch order items in chunks for totalSold
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

      // 4. Get total stock count
      const { data: products } = await supabase
        .from("products")
        .select("stock_qty")
        .eq("store_id", branchId)
        .is("deleted_at", null);
      const totalProducts = (products || []).reduce(
        (sum, p) => sum + (parseFloat(p.stock_qty) || 0),
        0,
      );

      return {
        totalRevenue,
        todayRevenue,
        totalOrders: allOrders.length,
        totalSold,
        totalProducts,
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

  getWeeklyAnalytics: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled")
      .gte("created_at", fourteenDaysAgo.toISOString());

    if (error) throw error;

    const dailyData = {};
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = 0;
    }

    (orders || []).forEach((o) => {
      const dateStr = new Date(o.created_at).toISOString().split("T")[0];
      if (dailyData[dateStr] !== undefined) {
        dailyData[dateStr] += o.total_amount || 0;
      }
    });

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
      previousWeekTotal += dailyData[days[i]] || 0;
    }

    let growth =
      previousWeekTotal > 0
        ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
        : currentWeekTotal > 0
          ? 100
          : 0;

    return {
      chartData: currentWeekSales.reverse(),
      growth: Math.round(growth * 10) / 10,
      totalWeekRevenue: currentWeekTotal,
    };
  },

  getFinanceStats: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount, created_at, payment_type")
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled");

    if (ordersError) throw ordersError;

    const totalRevenue = (orders || []).reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0,
    );

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `qty, products (cost_price), orders!inner (store_id, payment_status)`,
      )
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled");

    if (itemsError) throw itemsError;

    const totalExpense = (items || []).reduce(
      (sum, item) => sum + (item.products?.cost_price || 0) * (item.qty || 0),
      0,
    );

    const paymentStats = {};
    (orders || []).forEach((o) => {
      const method = o.payment_type || "Other";
      paymentStats[method] =
        (paymentStats[method] || 0) + (o.total_amount || 0);
    });

    const paymentChannels = Object.keys(paymentStats).map((method) => ({
      method,
      amount: paymentStats[method],
      percent:
        totalRevenue > 0
          ? Math.round((paymentStats[method] / totalRevenue) * 100)
          : 0,
    }));

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      paymentChannels,
    };
  },

  getDailyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (ordersError) throw ordersError;

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `qty, created_at, products (cost_price), orders!inner (store_id, payment_status)`,
      )
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (itemsError) throw itemsError;

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      income: 0,
      expense: 0,
    }));

    orders.forEach((o) => {
      hourlyData[new Date(o.created_at).getHours()].income +=
        o.total_amount || 0;
    });

    items.forEach((item) => {
      hourlyData[new Date(item.created_at).getHours()].expense +=
        (item.products?.cost_price || 0) * (item.qty || 0);
    });

    return hourlyData;
  },

  getMonthlyFinance: async (branchId) => {
    if (!branchId) throw new Error("Branch ID is required");

    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1).toISOString();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("store_id", branchId)
      .neq("payment_status", "cancelled")
      .gte("created_at", startOfYear);

    if (ordersError) throw ordersError;

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `qty, created_at, products (cost_price), orders!inner (store_id, payment_status)`,
      )
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled")
      .gte("created_at", startOfYear);

    if (itemsError) throw itemsError;

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
    const monthlyData = months.map((m) => ({ name: m, รายรับ: 0, รายจ่าย: 0 }));

    orders.forEach((o) => {
      monthlyData[new Date(o.created_at).getMonth()].รายรับ +=
        o.total_amount || 0;
    });

    items.forEach((item) => {
      monthlyData[new Date(item.created_at).getMonth()].รายจ่าย +=
        (item.products?.cost_price || 0) * (item.qty || 0);
    });

    return monthlyData;
  },

  getSalesHistory: async (branchId, timeRange) => {
    if (!branchId) throw new Error("Branch ID is required");

    // Use Asia/Bangkok Timezone for calculations
    const now = new Date();
    const thaiFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Helper to get Thai Date object
    const getThaiDate = (date) => {
      const parts = thaiFormatter.formatToParts(date);
      const dict = {};
      parts.forEach((p) => (dict[p.type] = p.value));
      return new Date(
        `${dict.year}-${dict.month}-${dict.day}T${dict.hour}:${dict.minute}:${dict.second}`,
      );
    };

    let startDate;
    let groupBy = "day";

    switch (timeRange) {
      case "1D":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0); // Start of day in local time
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
      .select(
        `
        subtotal,
        orders!inner (
          payment_status,
          created_at
        )
      `,
      )
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
        // Adjust for Thai Timezone (UTC+7)
        const date = new Date(item.orders.created_at);
        const thaiHour = new Date(
          date.getTime() + 7 * 60 * 60 * 1000,
        ).getUTCHours();
        const hourLabel = `${thaiHour.toString().padStart(2, "0")}:00`;

        if (hourlyMap[hourLabel] !== undefined) {
          hourlyMap[hourLabel] += parseFloat(item.subtotal) || 0;
        }
      });

      Object.keys(hourlyMap)
        .sort()
        .forEach((name) => {
          historyData.push({ name, totalSales: Math.ceil(hourlyMap[name]) });
        });
    } else if (groupBy === "day") {
      const dailyMap = {};

      if (timeRange === "1W") {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const datePart = new Date(d.getTime() + 7 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
          const label = days[d.getDay()];
          dailyMap[datePart] = { name: label, value: 0, fullDate: datePart };
        }
      } else {
        // "1M"
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(now.getFullYear(), now.getMonth(), i);
          const datePart = new Date(d.getTime() + 7 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          dailyMap[datePart] = {
            name: i.toString(),
            value: 0,
            fullDate: datePart,
          };
        }
      }

      (items || []).forEach((item) => {
        const date = new Date(item.orders.created_at);
        const datePart = new Date(date.getTime() + 7 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        if (dailyMap[datePart]) {
          dailyMap[datePart].value += parseFloat(item.subtotal) || 0;
        }
      });

      Object.keys(dailyMap)
        .sort()
        .forEach((key) => {
          historyData.push({
            name: dailyMap[key].name,
            totalSales: Math.ceil(dailyMap[key].value),
            fullDate: dailyMap[key].fullDate,
          });
        });
    } else if (groupBy === "month") {
      const months = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];
      const monthlyMap = {};
      months.forEach((m) => (monthlyMap[m] = 0));

      (items || []).forEach((item) => {
        const date = new Date(item.orders.created_at);
        const thaiMonth = new Date(
          date.getTime() + 7 * 60 * 60 * 1000,
        ).getUTCMonth();
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
