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

  getFinanceStats: async (storeId) => {
    if (!storeId) throw new Error("Store ID is required");

    // 1. Get manual transactions
    const { data: transactions } = await supabase.from("account_transactions").select("amount, trans_type").eq("store_id", storeId);
    let totalRevenue = 0, totalExpense = 0;
    (transactions || []).forEach((tx) => {
      if (tx.trans_type === "income") totalRevenue += Number(tx.amount || 0);
      else totalExpense += Number(tx.amount || 0);
    });

    // 2. Get order revenue and payment channels
    const { data: orders } = await supabase.from("orders").select("total_amount, payment_type, payment_method, payment_status").eq("store_id", storeId);

    const paymentStats = {
      "cash": 0,
      "transfer": 0,
      "credit": 0,
      "credit_sale": 0,
      "other": 0
    };

    (orders || []).forEach(o => {
      const amount = Number(o.total_amount || 0);
      totalRevenue += amount;

      const method = o.payment_type || o.payment_method || "cash";
      if (method === "credit_sale") {
        paymentStats["credit_sale"] += amount;
      } else if (paymentStats[method] !== undefined) {
        paymentStats[method] += amount;
      } else {
        paymentStats["other"] += amount;
      }
    });

    const totalOrdersRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const paymentChannels = Object.keys(paymentStats)
      .filter(key => paymentStats[key] > 0)
      .map((method) => ({
        method: method === "cash" ? "เงินสด" : method === "transfer" ? "โอนเงิน" : method === "credit" ? "เครดิต" : method === "credit_sale" ? "ค้างชำระ" : "อื่นๆ",
        amount: paymentStats[method],
        percent: totalOrdersRevenue > 0 ? Math.round((paymentStats[method] / totalOrdersRevenue) * 100) : 0
      }));

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      paymentChannels: paymentChannels.sort((a, b) => b.amount - a.amount)
    };
  },
};

module.exports = transactionService;
