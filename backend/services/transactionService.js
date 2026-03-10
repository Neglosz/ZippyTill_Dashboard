const { supabase } = require("../config/supabase");

const aggregateByHour = (transactions) => {
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ name: i.toString().padStart(2, "0") + ":00", income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const date = tx.created_at || tx.trans_date;
    if (!date) return;
    const hour = new Date(date).getHours();
    if (isNaN(hour) || hour < 0 || hour >= 24) return;
    if (tx.trans_type === "income") hourlyData[hour].income += Number(tx.amount || 0);
    else hourlyData[hour].expense += Number(tx.amount || 0);
  });
  return hourlyData;
};

const aggregateByDay = (transactions, date) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ name: (i + 1).toString(), income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const d = tx.trans_date || tx.created_at;
    if (!d) return;
    const day = new Date(d).getDate();
    if (isNaN(day) || day < 1 || day > daysInMonth) return;
    if (tx.trans_type === "income") dailyData[day - 1].income += Number(tx.amount || 0);
    else dailyData[day - 1].expense += Number(tx.amount || 0);
  });
  return dailyData;
};

const aggregateByMonth = (transactions) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((m) => ({ name: m, income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const d = tx.trans_date || tx.created_at;
    if (!d) return;
    const month = new Date(d).getMonth();
    if (isNaN(month) || month < 0 || month >= 12) return;
    if (tx.trans_type === "income") monthlyData[month].income += Number(tx.amount || 0);
    else monthlyData[month].expense += Number(tx.amount || 0);
  });
  return monthlyData;
};

const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    if (!storeId) throw new Error("Store ID is required");
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear(); const month = selectedDate.getMonth(); const day = selectedDate.getDate();
    let startDate, endDate;
    if (periodType === "day") {
      startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      endDate = startDate;
    }
    else if (periodType === "month") {
      startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
    }
    else if (periodType === "year") {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    let query = supabase.from("account_transactions").select("*").eq("store_id", storeId);
    if (periodType === "day") query = query.eq("trans_date", startDate);
    else query = query.gte("trans_date", startDate).lte("trans_date", endDate);

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;

    // Also include sales from orders that might not be in account_transactions
    let orderQuery = supabase.from("orders").select("total_amount, created_at").eq("store_id", storeId);
    if (periodType === "day") {
      orderQuery = orderQuery.gte("created_at", `${startDate}T00:00:00`).lte("created_at", `${startDate}T23:59:59`);
    } else {
      orderQuery = orderQuery.gte("created_at", `${startDate}T00:00:00`).lte("created_at", `${endDate}T23:59:59`);
    }

    const { data: orderData } = await orderQuery;

    const combinedData = [...(data || [])];
    (orderData || []).forEach(o => {
      combinedData.push({
        amount: o.total_amount,
        trans_type: "income",
        created_at: o.created_at,
        trans_date: o.created_at ? o.created_at.split("T")[0] : null
      });
    });

    if (periodType === "day") return aggregateByHour(combinedData);
    else if (periodType === "month") return aggregateByDay(combinedData, selectedDate);
    else return aggregateByMonth(combinedData);
  },

  getRecentTransactions: async (storeId, limit = 10) => {
    if (!storeId) throw new Error("Store ID is required");
    const { data, error } = await supabase.from("account_transactions").select("*").eq("store_id", storeId).order("created_at", { ascending: false }).limit(limit);
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
      totalOrderRevenue += amount;

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

    const totalRevenue = totalOrderRevenue + totalOtherIncome;
    const grossProfit = totalOrderRevenue - totalCOGS;
    const netProfit = totalRevenue - totalCOGS - totalOtherExpense;

    const totalOrdersRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const paymentChannels = ["cash", "transfer", "credit_sale"].map((methodKey) => {
      const translateMap = { "cash": "เงินสด", "transfer": "โอนเงิน", "credit_sale": "ค้างชำระ" };
      return {
        method: translateMap[methodKey],
        amount: paymentStats[methodKey],
        percent: totalOrdersRevenue > 0 ? Math.round((paymentStats[methodKey] / totalOrdersRevenue) * 100) : 0
      };
    });

    return {
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpense: totalCOGS + totalOtherExpense,
      netProfit,
      paymentChannels: paymentChannels.sort((a, b) => b.amount - a.amount)
    };
  },
};

module.exports = transactionService;
