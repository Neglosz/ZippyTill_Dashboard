import { supabase } from "../lib/supabase";

export const financeService = {
  // Fetch transactions for a specific period
  async getTransactions(branchId, startDate, endDate) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("account_transactions")
      .select("*")
      .eq("store_id", branchId)
      .gte("trans_date", startDate)
      .lte("trans_date", endDate)
      .order("trans_date", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get Graph Data for Day/Month/Year views
  async getGraphData(branchId, viewType) {
    if (!branchId) throw new Error("Branch ID is required");

    // Use local date for boundaries
    const now = new Date();
    let startDate, endDate;

    // Helper to get local ISO date YYYY-MM-DD
    const getLocalDate = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date - offset).toISOString().slice(0, -1);
      return localISOTime.split("T")[0];
    };

    if (viewType === "day") {
      // Current Day
      const today = getLocalDate(now);
      startDate = today;
      endDate = today;
    } else if (viewType === "month") {
      // Current Month
      const y = now.getFullYear();
      const m = now.getMonth();
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      startDate = getLocalDate(firstDay);
      endDate = getLocalDate(lastDay);
    } else if (viewType === "year") {
      // Current Year
      const y = now.getFullYear();
      startDate = `${y}-01-01`;
      endDate = `${y}-12-31`;
    }

    // Fetch transactions
    // Only filter by date range
    const { data: transactions, error } = await supabase
      .from("account_transactions")
      .select("*")
      .eq("store_id", branchId)
      .gte("trans_date", startDate)
      .lte("trans_date", endDate);

    if (error) throw error;

    // Process Data
    let processedData = [];

    if (viewType === "day") {
      // 00-23 Hour buckets
      const hourly = Array.from({ length: 24 }, (_, i) => ({
        name: i.toString().padStart(2, "0") + ":00",
        income: 0,
        expense: 0,
      }));

      transactions.forEach((t) => {
        // Use created_at for time distribution if available
        // If created_at is strictly used.
        const date = new Date(t.created_at);
        const hour = date.getHours();
        if (hour >= 0 && hour < 24) {
          if (t.trans_type === "income")
            hourly[hour].income += Number(t.amount);
          if (t.trans_type === "expense")
            hourly[hour].expense += Number(t.amount);
        }
      });
      processedData = hourly;
    } else if (viewType === "month") {
      // 1-31 Day buckets
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const daily = Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString(),
        income: 0,
        expense: 0,
      }));

      transactions.forEach((t) => {
        const day = new Date(t.trans_date).getDate();
        if (day >= 1 && day <= daysInMonth) {
          if (t.trans_type === "income")
            daily[day - 1].income += Number(t.amount);
          if (t.trans_type === "expense")
            daily[day - 1].expense += Number(t.amount);
        }
      });
      processedData = daily;
    } else if (viewType === "year") {
      // Jan-Dec buckets
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
      const monthly = months.map((m) => ({ name: m, income: 0, expense: 0 }));

      transactions.forEach((t) => {
        const month = new Date(t.trans_date).getMonth();
        if (month >= 0 && month < 12) {
          if (t.trans_type === "income")
            monthly[month].income += Number(t.amount);
          if (t.trans_type === "expense")
            monthly[month].expense += Number(t.amount);
        }
      });
      processedData = monthly;
    }

    return processedData;
  },
};
