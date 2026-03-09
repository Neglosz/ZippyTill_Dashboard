const { supabase } = require("../config/supabase");

const taxService = {
    async getTaxSummary(branchId, year, period) {
        if (!branchId) throw new Error("Branch ID is required");

        // Period "1-6" means Jan-Jun, "1-12" means Jan-Dec
        let startDate, endDate;
        if (period === "1-6") {
            startDate = `${year}-01-01`;
            endDate = `${year}-06-30`;
        } else if (period === "1-12") {
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
        } else {
            // Default to full year if not specified or different
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
        }

        // 1. Get Income from account_transactions (trans_type = 'income')
        const { data: incomeData, error: incomeError } = await supabase
            .from("account_transactions")
            .select("amount")
            .eq("store_id", branchId)
            .eq("trans_type", "income")
            .gte("trans_date", startDate)
            .lte("trans_date", endDate);

        if (incomeError) throw incomeError;

        const totalIncome = (incomeData || []).reduce(
            (sum, t) => sum + Number(t.amount || 0),
            0,
        );

        // 2. Get Expenses from account_transactions (trans_type = 'expense')
        const { data: expenseData, error: expenseError } = await supabase
            .from("account_transactions")
            .select("amount")
            .eq("store_id", branchId)
            .eq("trans_type", "expense")
            .gte("trans_date", startDate)
            .lte("trans_date", endDate);

        if (expenseError) throw expenseError;

        const generalExpenses = (expenseData || []).reduce(
            (sum, t) => sum + Number(t.amount || 0),
            0,
        );

        // 3. Get COGS (Cost of Goods Sold) from order_items
        const { data: cogsData, error: cogsError } = await supabase
            .from("order_items")
            .select(`
        qty,
        products (cost_price),
        orders!inner (store_id, payment_status, created_at)
      `)
            .eq("orders.store_id", branchId)
            .neq("orders.payment_status", "cancelled")
            .gte("orders.created_at", `${startDate}T00:00:00Z`)
            .lte("orders.created_at", `${endDate}T23:59:59Z`);

        if (cogsError) throw cogsError;

        const totalCogs = (cogsData || []).reduce(
            (sum, item) => sum + (Number(item.qty || 0) * Number(item.products?.cost_price || 0)),
            0,
        );

        return {
            totalIncome,
            totalExpenses: generalExpenses + totalCogs,
            details: {
                income: totalIncome,
                generalExpenses,
                cogs: totalCogs,
                period,
                year
            }
        };
    }
};

module.exports = taxService;
