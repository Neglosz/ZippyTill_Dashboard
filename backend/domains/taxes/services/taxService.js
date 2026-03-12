const { supabase } = require("../../core/config/supabase");

/**
 * Calculation logic moved from frontend to ensure backend is the source of truth.
 * Formulas and brackets are preserved exactly as they were in the frontend.
 */

const taxService = {
    calculatePIT(income, expenses, deductions) {
        const taxableIncome = Math.max(0, (Number(income) || 0) - (Number(expenses) || 0) - (Number(deductions) || 0));
        
        let remaining = taxableIncome;
        let totalTax = 0;
        const brackets = [
            { min: 0, limit: 150000, rate: 0, label: "ยกเว้น (0%)" },
            { min: 150001, limit: 150000, rate: 0.05, label: "5%" },
            { min: 300001, limit: 200000, rate: 0.1, label: "10%" },
            { min: 500001, limit: 250000, rate: 0.15, label: "15%" },
            { min: 750001, limit: 250000, rate: 0.2, label: "20%" },
            { min: 1000001, limit: 1000000, rate: 0.25, label: "25%" },
            { min: 2000001, limit: 3000000, rate: 0.3, label: "30%" },
            { min: 5000001, limit: Infinity, rate: 0.35, label: "35%" },
        ];

        let currentRateLabel = "0%";
        for (const bracket of brackets) {
            if (remaining <= 0) break;
            const taxableInThisBracket = Math.min(remaining, bracket.limit);
            totalTax += taxableInThisBracket * bracket.rate;
            remaining -= taxableInThisBracket;
            if (taxableInThisBracket > 0) currentRateLabel = bracket.label;
        }

        return {
            taxableIncome,
            totalTax,
            currentRateLabel,
        };
    },

    calculateVAT(buyAmount, sellAmount) {
        const buyVat = ((Number(buyAmount) || 0) * 7) / 100;
        const sellVat = ((Number(sellAmount) || 0) * 7) / 100;
        const netVat = sellVat - buyVat;

        return {
            buyVat,
            sellVat,
            netVat,
        };
    },

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

        const totalOtherIncome = (incomeData || []).reduce(
            (sum, t) => sum + Number(t.amount || 0),
            0,
        );

        // 1.5 Get Order Revenue
        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("store_id", branchId)
            .neq("payment_status", "cancelled")
            .gte("created_at", `${startDate}T00:00:00Z`)
            .lte("created_at", `${endDate}T23:59:59Z`);

        if (orderError) throw orderError;

        const totalOrderRevenue = (orderData || []).reduce(
            (sum, o) => sum + Number(o.total_amount || 0),
            0,
        );

        const totalIncome = totalOrderRevenue;

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
        cost_price_at_sale,
        products (cost_price),
        orders!inner (store_id, payment_status, created_at)
      `)
            .eq("orders.store_id", branchId)
            .neq("orders.payment_status", "cancelled")
            .gte("orders.created_at", `${startDate}T00:00:00Z`)
            .lte("orders.created_at", `${endDate}T23:59:59Z`);

        if (cogsError) throw cogsError;

        const totalCogs = (cogsData || []).reduce(
            (sum, item) => {
                const cost = Number(item.cost_price_at_sale ?? item.products?.cost_price ?? 0);
                return sum + (Number(item.qty || 0) * cost);
            },
            0,
        );

        const totalExpenses = generalExpenses + totalCogs;

        // Perform calculations using extracted logic
        const pit = this.calculatePIT(totalIncome, totalExpenses, 0);
        const vat = this.calculateVAT(totalCogs, totalOrderRevenue);

        return {
            totalIncome,
            totalExpenses,
            ...pit,
            ...vat,
            details: {
                orderRevenue: totalOrderRevenue,
                otherIncome: totalOtherIncome,
                generalExpenses,
                cogs: totalCogs,
                outputTax: vat.sellVat,
                inputTax: vat.buyVat,
                period,
                year
            }
        };
    }
};

module.exports = taxService;

