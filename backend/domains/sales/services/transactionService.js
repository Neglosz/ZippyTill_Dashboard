const { supabase } = require("../../core/config/supabase");

const aggregateByHour = (transactions) => {
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ name: i.toString().padStart(2, "0") + ":00", income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const dateStr = tx.created_at || tx.trans_date;
    if (!dateStr) return;
    
    // Adjust to Thai Time (+7) for grouping
    const date = new Date(dateStr);
    const thaiHour = new Date(date.getTime() + (7 * 60 * 60 * 1000)).getUTCHours();
    
    if (thaiHour >= 0 && thaiHour < 24) {
      if (tx.trans_type === "income") hourlyData[thaiHour].income += Number(tx.amount || 0);
      else hourlyData[thaiHour].expense += Number(tx.amount || 0);
    }
  });
  return hourlyData;
};

const aggregateByDay = (transactions, year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ name: (i + 1).toString(), income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const dStr = tx.trans_date || tx.created_at;
    if (!dStr) return;
    
    // Adjust to Thai Time (+7)
    const dateObj = new Date(dStr);
    const thaiDay = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000)).getUTCDate();
    
    if (thaiDay >= 1 && thaiDay <= daysInMonth) {
      if (tx.trans_type === "income") dailyData[thaiDay - 1].income += Number(tx.amount || 0);
      else dailyData[thaiDay - 1].expense += Number(tx.amount || 0);
    }
  });
  return dailyData;
};

const aggregateByMonth = (transactions) => {
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const monthlyData = months.map((m) => ({ name: m, income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const dStr = tx.trans_date || tx.created_at;
    if (!dStr) return;
    
    // Adjust to Thai Time (+7)
    const dateObj = new Date(dStr);
    const thaiMonth = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000)).getUTCMonth();
    
    if (thaiMonth >= 0 && thaiMonth < 12) {
      if (tx.trans_type === "income") monthlyData[thaiMonth].income += Number(tx.amount || 0);
      else monthlyData[thaiMonth].expense += Number(tx.amount || 0);
    }
  });
  return monthlyData;
};

const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    if (!storeId) throw new Error("Store ID is required");
    
    // Input date is YYYY-MM-DD (Thai Time)
    const [year, month, day] = date.split('-').map(Number);
    
    let startDateStr, endDateStr;
    
    if (periodType === "day") {
      startDateStr = date;
      endDateStr = date;
    } else if (periodType === "month") {
      startDateStr = `${year}-${String(month).padStart(2, "0")}-01`;
      endDateStr = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
    } else {
      startDateStr = `${year}-01-01`;
      endDateStr = `${year}-12-31`;
    }

    // 1. Get manual transactions (use trans_date for consistency with summary)
    let txnQuery = supabase.from("account_transactions")
      .select("amount, trans_type, category, reference_order_id, created_at, trans_date")
      .eq("store_id", storeId);
    
    txnQuery = txnQuery.gte("trans_date", startDateStr).lte("trans_date", endDateStr);

    const { data: manualData, error } = await txnQuery;
    if (error) throw error;

    // 2. Get order revenue (use created_at with offset for consistency with summary)
    let orderQuery = supabase.from("orders")
      .select("total_amount, created_at, payment_type, payment_status")
      .eq("store_id", storeId)
      .neq("payment_status", "cancelled");

    orderQuery = orderQuery.gte("created_at", `${startDateStr}T00:00:00+07:00`)
                           .lte("created_at", `${endDateStr}T23:59:59+07:00`);

    const { data: orderData } = await orderQuery;

    const combinedData = [];
    const txnOrderIds = new Set(manualData?.map(t => t.reference_order_id).filter(Boolean) || []);

    // Filter manual data to remove double counts
    (manualData || []).forEach(tx => {
       if (tx.category === "sales" && tx.reference_order_id) return;
       combinedData.push(tx);
    });

    (orderData || []).forEach(o => {
      if (o.payment_type === "credit_sale" && o.payment_status !== "paid") return;
      if (txnOrderIds.has(o.id)) return; 

      combinedData.push({
        amount: o.total_amount,
        trans_type: "income",
        created_at: o.created_at,
      });
    });

    if (periodType === "day") return aggregateByHour(combinedData);
    else if (periodType === "month") return aggregateByDay(combinedData, year, month);
    else return aggregateByMonth(combinedData);
  },

  getRecentActivity: async (storeId, limit = 100, filterDate = null) => {
    if (!storeId) throw new Error("Store ID is required");

    // Fetch orders and manual transactions in parallel
    const [ordersRes, manualRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_no, total_amount, payment_status, status, created_at, payment_type, customers_info(name), payments(method)")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("account_transactions")
        .select("*, orders:reference_order_id(customers_info(name))")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit)
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (manualRes.error) throw manualRes.error;

    let recentOrders = ordersRes.data || [];
    let recentManual = manualRes.data || [];

    // Date filtering logic (same as frontend)
    if (filterDate) {
      recentOrders = recentOrders.filter(o => o.created_at.startsWith(filterDate));
      recentManual = recentManual.filter(m => m.created_at.startsWith(filterDate));
    }

    const formatPaymentMethod = (sale) => {
      if (sale.payment_type === "credit_sale") return "ค้างชำระ";
      const method = sale.payments?.[0]?.method;
      if (method === "qr_promptpay" || method === "transfer") return "โอนเงิน";
      return "เงินสด";
    };

    const normalizedOrders = recentOrders.map((o) => ({
      ...o,
      source: "order",
      displayType: formatPaymentMethod(o),
      displayAmount: Number(o.total_amount),
      displayName: o.order_no,
      displaySubtitle: o.customers_info?.name || "ลูกค้าทั่วไป",
      isIncome: true,
      clickable: true,
      isCancelled: o.payment_status === "cancelled" || o.status === "cancelled",
    }));

    const normalizedManual = recentManual
      .filter((m) => !(m.category === "sales" && m.reference_order_id))
      .map((m) => {
        let displayName = m.description || m.category || "ไม่ระบุรายการ";
        const customerName = m.orders?.customers_info?.name;
        if (m.category === "debt_payment" && customerName) {
          displayName = `รับชำระหนี้ : ${customerName}`;
        }
        return {
          ...m,
          source: "manual",
          displayType: m.trans_type === "income" ? "รายรับอื่น" : "รายจ่าย",
          displayAmount: Number(m.amount),
          displayName,
          displaySubtitle: m.category === "debt_payment" ? "ชำระหนี้" : m.category,
          isIncome: m.trans_type === "income",
          clickable: false,
          isCancelled: false,
        };
      });

    return [...normalizedOrders, ...normalizedManual].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  },

  getRecentTransactions: async (storeId, limit = 10, date) => {
    if (!storeId) throw new Error("Store ID is required");
    
    let query = supabase
      .from("account_transactions")
      .select("*, orders(customers_info(name))")
      .eq("store_id", storeId);

    if (date) {
      if (date.length === 4) {
        // YYYY
        const start = `${date}-01-01T00:00:00+07:00`;
        const end = `${date}-12-31T23:59:59+07:00`;
        query = query.gte("created_at", start).lte("created_at", end);
      } else if (date.length === 7) {
        // YYYY-MM
        const year = parseInt(date.substring(0, 4));
        const month = parseInt(date.substring(5, 7)) - 1;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const start = `${date}-01T00:00:00+07:00`;
        const end = `${date}-${String(lastDay).padStart(2, '0')}T23:59:59+07:00`;
        query = query.gte("created_at", start).lte("created_at", end);
      } else {
        // YYYY-MM-DD
        const start = `${date}T00:00:00+07:00`;
        const end = `${date}T23:59:59+07:00`;
        query = query.gte("created_at", start).lte("created_at", end);
      }
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  },

  getFinanceStats: async (storeId, periodType, date) => {
    if (!storeId) throw new Error("Store ID is required");

    let startDate, endDate;
    const selectedDate = date ? new Date(date) : new Date();
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    if (periodType === "day") {
      startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      endDate = startDate;
    } else if (periodType === "month") {
      startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
    } else if (periodType === "year") {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    // 1. Get manual transactions
    let txnQuery = supabase.from("account_transactions").select("amount, trans_type, category, reference_order_id").eq("store_id", storeId);
    if (periodType && periodType !== "all") {
      txnQuery = txnQuery.gte("trans_date", startDate).lte("trans_date", endDate);
    }
    const { data: transactions } = await txnQuery;

    let totalOtherIncome = 0, totalOtherExpense = 0;
    (transactions || []).forEach((tx) => {
      // Skip order-linked sales transactions to avoid double counting with order revenue
      if (tx.category === "sales" && tx.reference_order_id) return;
      
      if (tx.trans_type === "income") totalOtherIncome += Number(tx.amount || 0);
      else totalOtherExpense += Number(tx.amount || 0);
    });

    // 2. Get order revenue and payment channels
    let orderQuery = supabase
      .from("orders")
      .select("id, total_amount, payment_type, payment_status, created_at, payments(method), order_items(qty, cost_price_at_sale, products(cost_price))")
      .eq("store_id", storeId)
      .neq("payment_status", "cancelled");

    if (periodType && periodType !== "all") {
      orderQuery = orderQuery.gte("created_at", `${startDate}T00:00:00+07:00`).lte("created_at", `${endDate}T23:59:59+07:00`);
    }
    const { data: orders } = await orderQuery;

    let totalOrderRevenue = 0;
    let totalCOGS = 0;

    const paymentStats = {
      "cash": 0,
      "transfer": 0,
      "credit": 0,
      "credit_sale": 0
    };

    (orders || []).forEach(o => {
      const amount = Number(o.total_amount || 0);
      
      // TC001 FIX: Credit sales shouldn't count as revenue until paid
      if (!(o.payment_type === "credit_sale" && o.payment_status !== "paid")) {
        totalOrderRevenue += amount;
      }

      // Calculate COGS from order items
      if (o.order_items) {
        o.order_items.forEach(item => {
          const cost = Number(item.cost_price_at_sale ?? item.products?.cost_price ?? 0);
          totalCOGS += (Number(item.qty || 0) * cost);
        });
      }

      let method = "cash";
      if (o.payment_type === "credit_sale") {
        method = "credit_sale";
      } else if (o.payments && o.payments.length > 0 && o.payments[0].method) {
        method = o.payments[0].method;
      } else {
        method = o.payment_type || "cash";
      }

      if (method === "qr_promptpay" || method === "transfer") {
        method = "transfer";
      }

      if (paymentStats[method] !== undefined) {
        paymentStats[method] += amount;
      }
    });

    const totalRevenue = Math.round((totalOrderRevenue + totalOtherIncome) * 100) / 100;
    const grossProfit = Math.round((totalOrderRevenue - totalCOGS) * 100) / 100;
    const netProfit = Math.round((totalRevenue - totalCOGS - totalOtherExpense) * 100) / 100;

    const totalOrdersRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const paymentChannels = ["cash", "transfer", "credit_sale"].map((methodKey) => {
      const translateMap = { "cash": "เงินสด", "transfer": "โอนเงิน", "credit_sale": "ค้างชำระ" };
      const channelAmount = Math.round((paymentStats[methodKey] || 0) * 100) / 100;
      return {
        method: translateMap[methodKey],
        amount: channelAmount,
        percent: totalOrdersRevenue > 0 ? Math.round((channelAmount / totalOrdersRevenue) * 100) : 0
      };
    });

    return {
      totalRevenue,
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      grossProfit,
      totalExpense: Math.round((totalCOGS + totalOtherExpense) * 100) / 100,
      netProfit,
      paymentChannels: paymentChannels.sort((a, b) => b.amount - a.amount)
    };
  },
};

module.exports = transactionService;
