const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");
const transactionService = require("./services/transactionService");

async function debugDayGraph() {
  const storeId = "22b1e365-d849-4a84-ad58-5111247aa090";
  const date = "2026-03-10";
  
  try {
    console.log(`Debugging Day Graph for ${date}...`);
    const data = await transactionService.getAggregatedTransactions(storeId, "day", date);
    
    console.log("Aggregated Result Sample (first 5 hours):");
    console.log(data.slice(0, 5));
    
    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
    
    console.log(`Total Income in graph: ${totalIncome}`);
    console.log(`Total Expense in graph: ${totalExpense}`);
    
    if (totalIncome === 0 && totalExpense === 0) {
      console.log("ALERT: All values are ZERO. Checking why...");
      // Let's check raw data fetch
      const year = 2026, month = 2, day = 10;
      const d = new Date(year, month, day);
      const start = new Date(d.getTime() - (7 * 60 * 60 * 1000)).toISOString();
      const end = new Date(d.getTime() + (17 * 60 * 60 * 1000)).toISOString();
      
      const { data: rawTx } = await supabase.from("account_transactions").select("*").eq("store_id", storeId).gte("created_at", start).lte("created_at", end);
      console.log(`Raw transactions found: ${rawTx?.length || 0}`);
    }

  } catch (err) {
    console.error("Debug Error:", err);
  }
}

debugDayGraph();
