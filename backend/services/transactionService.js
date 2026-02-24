const { supabase } = require("../config/supabase");

const aggregateByHour = (transactions) => {
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ name: i.toString().padStart(2, "0") + ":00", income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const hour = new Date(tx.created_at || tx.trans_date).getHours();
    if (tx.trans_type === "income") hourlyData[hour].income += Number(tx.amount);
    else hourlyData[hour].expense += Number(tx.amount);
  });
  return hourlyData;
};

const aggregateByDay = (transactions, date) => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ name: (i + 1).toString(), income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const day = new Date(tx.trans_date).getDate();
    if (tx.trans_type === "income") dailyData[day - 1].income += Number(tx.amount);
    else dailyData[day - 1].expense += Number(tx.amount);
  });
  return dailyData;
};

const aggregateByMonth = (transactions) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((m) => ({ name: m, income: 0, expense: 0 }));
  transactions.forEach((tx) => {
    const month = new Date(tx.trans_date).getMonth();
    if (tx.trans_type === "income") monthlyData[month].income += Number(tx.amount);
    else monthlyData[month].expense += Number(tx.amount);
  });
  return monthlyData;
};

const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    if (!storeId) throw new Error("Store ID is required");
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear(); const month = selectedDate.getMonth(); const day = selectedDate.getDate();
    let startDate, endDate;
    if (periodType === "day") { startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; endDate = startDate; }
    else if (periodType === "month") { startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`; endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`; }
    else if (periodType === "year") { startDate = `${year}-01-01`; endDate = `${year}-12-31`; }

    let query = supabase.from("account_transactions").select("*").eq("store_id", storeId);
    if (periodType === "day") query = query.eq("trans_date", startDate);
    else query = query.gte("trans_date", startDate).lte("trans_date", endDate);

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    if (periodType === "day") return aggregateByHour(data);
    else if (periodType === "month") return aggregateByDay(data, selectedDate);
    else return aggregateByMonth(data);
  },

  getRecentTransactions: async (storeId, limit = 10) => {
    if (!storeId) throw new Error("Store ID is required");
    const { data, error } = await supabase.from("account_transactions").select("*").eq("store_id", storeId).order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },

  getFinanceStats: async (storeId) => {
    if (!storeId) throw new Error("Store ID is required");
    const { data: transactions } = await supabase.from("account_transactions").select("amount, trans_type").eq("store_id", storeId);
    let totalRevenue = 0, totalExpense = 0;
    (transactions || []).forEach((tx) => { if (tx.trans_type === "income") totalRevenue += Number(tx.amount); else totalExpense += Number(tx.amount); });
    const { data: payments } = await supabase.from("payments").select(`method, amount, orders!inner(store_id)`).eq("orders.store_id", storeId);
    const paymentStats = {}; let totalPayments = 0;
    (payments || []).forEach((p) => { const amount = Number(p.amount); const method = p.method || "Other"; paymentStats[method] = (paymentStats[method] || 0) + amount; totalPayments += amount; });
    const { data: creditOrders } = await supabase.from("orders").select("total_amount").eq("store_id", storeId).eq("payment_type", "credit_sale");
    let overdueTotal = 0; (creditOrders || []).forEach((o) => { overdueTotal += Number(o.total_amount || 0); });
    const totalWithOverdue = totalPayments + overdueTotal;
    const paymentChannels = Object.keys(paymentStats).map((method) => ({ method: method === "cash" ? "เงินสด" : method === "qr_promptpay" ? "QR PromptPay" : method === "credit" ? "เครดิต" : method, amount: paymentStats[method], percent: totalWithOverdue > 0 ? Math.round((paymentStats[method] / totalWithOverdue) * 100) : 0 }));
    if (overdueTotal > 0) paymentChannels.push({ method: "credit_sale", amount: overdueTotal, percent: totalWithOverdue > 0 ? Math.round((overdueTotal / totalWithOverdue) * 100) : 0 });
    return { totalRevenue, totalExpense, netProfit: totalRevenue - totalExpense, paymentChannels: paymentChannels.sort((a, b) => b.amount - a.amount) };
  },
};

module.exports = transactionService;
