import { supabase } from "../lib/supabase";

export const transactionService = {
  getAggregatedTransactions: async (storeId, periodType, date) => {
    if (!storeId) throw new Error("Store ID is required");

    let startDate, endDate;
    const selectedDate = new Date(date);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    if (periodType === "day") {
      // For day view, filter by trans_date (Business Date) instead of created_at
      // This ensures that sales belonging to a business day appear on that day's report
      startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      endDate = startDate;
    } else if (periodType === "month") {
      // First day of month
      startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      // Last day of month
      const lastDay = new Date(year, month + 1, 0).getDate();
      endDate = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;
    } else if (periodType === "year") {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    try {
      let query = supabase
        .from("account_transactions")
        .select("*")
        .eq("store_id", storeId);

      if (periodType === "day") {
        query = query.eq("trans_date", startDate);
      } else {
        // For month/year views, filter by trans_date
        query = query.gte("trans_date", startDate).lte("trans_date", endDate);
      }

      const { data, error } = await query.order("created_at", {
        ascending: true,
      });

      if (error) throw error;

      if (periodType === "day") {
        return aggregateByHour(data);
      } else if (periodType === "month") {
        return aggregateByDay(data, selectedDate);
      } else {
        return aggregateByMonth(data);
      }
    } catch (error) {
      console.error(
        "transactionService getAggregatedTransactions error:",
        error,
      );
      throw error;
    }
  },

  getRecentTransactions: async (storeId, limit = 10) => {
    if (!storeId) throw new Error("Store ID is required");
    try {
      const { data, error } = await supabase
        .from("account_transactions")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("transactionService getRecentTransactions error:", error);
      throw error;
    }
  },

  getFinanceStats: async (storeId) => {
    if (!storeId) throw new Error("Store ID is required");
    try {
      // 1. Get income/expense from account_transactions
      const { data: transactions, error: txError } = await supabase
        .from("account_transactions")
        .select("amount, trans_type")
        .eq("store_id", storeId);

      if (txError) throw txError;

      let totalRevenue = 0;
      let totalExpense = 0;

      (transactions || []).forEach((tx) => {
        const amount = Number(tx.amount);
        if (tx.trans_type === "income") {
          totalRevenue += amount;
        } else {
          totalExpense += amount;
        }
      });

      // 2. Get payment channels from payments table (joined with orders)
      const { data: payments, error: payError } = await supabase
        .from("payments")
        .select(
          `
          method,
          amount,
          orders!inner(store_id)
        `,
        )
        .eq("orders.store_id", storeId);

      if (payError) throw payError;

      const paymentStats = {};
      let totalPayments = 0;

      (payments || []).forEach((p) => {
        const amount = Number(p.amount);
        const method = p.method || "Other";
        paymentStats[method] = (paymentStats[method] || 0) + amount;
        totalPayments += amount;
      });

      // 3. Get overdue (credit_sale) orders
      const { data: creditOrders, error: creditError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("store_id", storeId)
        .eq("payment_type", "credit_sale");

      let overdueTotal = 0;
      if (!creditError && creditOrders) {
        creditOrders.forEach((o) => {
          overdueTotal += Number(o.total_amount || 0);
        });
      }

      const totalWithOverdue = totalPayments + overdueTotal;

      const paymentChannels = Object.keys(paymentStats).map((method) => ({
        method:
          method === "cash"
            ? "เงินสด"
            : method === "qr_promptpay"
              ? "QR PromptPay"
              : method === "credit"
                ? "เครดิต"
                : method,
        amount: paymentStats[method],
        percent:
          totalWithOverdue > 0
            ? Math.round((paymentStats[method] / totalWithOverdue) * 100)
            : 0,
      }));

      // Add overdue channel if there are any credit_sale orders
      if (overdueTotal > 0) {
        paymentChannels.push({
          method: "credit_sale",
          amount: overdueTotal,
          percent:
            totalWithOverdue > 0
              ? Math.round((overdueTotal / totalWithOverdue) * 100)
              : 0,
        });
      }

      // Sort by amount descending
      paymentChannels.sort((a, b) => b.amount - a.amount);

      return {
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense,
        paymentChannels,
      };
    } catch (error) {
      console.error("transactionService getFinanceStats error:", error);
      throw error;
    }
  },
};

const aggregateByHour = (transactions) => {
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    name: i.toString().padStart(2, "0") + ":00",
    income: 0,
    expense: 0,
  }));

  transactions.forEach((tx) => {
    // Use created_at for hourly view since trans_date is just a date without time
    const timestamp = tx.created_at || tx.trans_date;
    const hour = new Date(timestamp).getHours();
    if (tx.trans_type === "income") {
      hourlyData[hour].income += Number(tx.amount);
    } else {
      hourlyData[hour].expense += Number(tx.amount);
    }
  });

  return hourlyData;
};

const aggregateByDay = (transactions, date) => {
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    name: (i + 1).toString(),
    income: 0,
    expense: 0,
  }));

  transactions.forEach((tx) => {
    const day = new Date(tx.trans_date).getDate();
    if (tx.trans_type === "income") {
      dailyData[day - 1].income += Number(tx.amount);
    } else {
      dailyData[day - 1].expense += Number(tx.amount);
    }
  });

  return dailyData;
};

const aggregateByMonth = (transactions) => {
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
    income: 0,
    expense: 0,
  }));

  transactions.forEach((tx) => {
    const month = new Date(tx.trans_date).getMonth();
    if (tx.trans_type === "income") {
      monthlyData[month].income += Number(tx.amount);
    } else {
      monthlyData[month].expense += Number(tx.amount);
    }
  });

  return monthlyData;
};
