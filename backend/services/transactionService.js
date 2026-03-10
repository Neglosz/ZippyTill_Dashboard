const { supabase } = require("../config/supabase");

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

const aggregateByDay = (transactions, date) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
    
    // Parse input date (Expects YYYY-MM-DD)
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const selectedDate = new Date(year, month, day);
    
    let startDate, endDate;
    
    // Define Thai Day Range in UTC for query
    if (periodType === "day") {
      // Thai 00:00:00 is UTC 17:00:00 of previous day
      const start = new Date(Date.UTC(year, month, day, 0, 0, 0));
      start.setUTCHours(start.getUTCHours() - 7);
      
      const end = new Date(start.getTime() + (24 * 60 * 60 * 1000) - 1000);
      
      startDate = start.toISOString();
      endDate = end.toISOString();
    } else if (periodType === "month") {
      const first = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      first.setUTCHours(first.getUTCHours() - 7);
      
      const last = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
      last.setUTCHours(last.getUTCHours() - 7);
      
      startDate = first.toISOString();
      endDate = last.toISOString();
    } else {
      startDate = `${year}-01-01T00:00:00Z`;
      endDate = `${year}-12-31T23:59:59Z`;
    }

    // Query from account_transactions
    let query = supabase.from("account_transactions").select("*").eq("store_id", storeId);
    query = query.gte("created_at", startDate).lte("created_at", endDate);

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;

    // Query from orders
    let orderQuery = supabase.from("orders").select("total_amount, created_at, payment_type, payment_status").eq("store_id", storeId);
    orderQuery = orderQuery.gte("created_at", startDate).lte("created_at", endDate);

    const { data: orderData } = await orderQuery;

    const combinedData = [...(data || [])];
    (orderData || []).forEach(o => {
      if (o.payment_type === "credit_sale" && o.payment_status !== "paid") return;

      combinedData.push({
        amount: o.total_amount,
        trans_type: "income",
        created_at: o.created_at,
      });
    });

    if (periodType === "day") return aggregateByHour(combinedData);
    else if (periodType === "month") return aggregateByDay(combinedData, selectedDate);
    else return aggregateByMonth(combinedData);
  },

  getRecentTransactions: async (storeId, limit = 10, date) => {
    if (!storeId) throw new Error("Store ID is required");
    
    let query = supabase
      .from("account_transactions")
      .select("*, orders(customers_info(name))")
      .eq("store_id", storeId);

    if (date) {
      // Assuming trans_date is stored as YYYY-MM-DD or similar
      query = query.eq("trans_date", date);
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
    let txnQuery = supabase.from("account_transactions").select("amount, trans_type").eq("store_id", storeId);
    if (periodType && periodType !== "all") {
      txnQuery = txnQuery.gte("trans_date", startDate).lte("trans_date", endDate);
    }
    const { data: transactions } = await txnQuery;

    let totalOtherIncome = 0, totalOtherExpense = 0;
    (transactions || []).forEach((tx) => {
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
      orderQuery = orderQuery.gte("created_at", `${startDate}T00:00:00`).lte("created_at", `${endDate}T23:59:59`);
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
