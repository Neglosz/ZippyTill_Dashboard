const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");
const transactionService = require("./services/transactionService");

async function testChartData() {
  const storeId = "22b1e365-d849-4a84-ad58-5111247aa090";
  const date = "2026-03-10";
  
  try {
    console.log(`Testing day view for ${date}...`);
    const dayData = await transactionService.getAggregatedTransactions(storeId, "day", date);
    console.log("Day Data Sample (first 3):", dayData.slice(0, 3));
    console.log("Day Data total entries:", dayData.length);
    const hasData = dayData.some(d => d.income > 0 || d.expense > 0);
    console.log("Has non-zero data in day view?", hasData);

    console.log(`\nTesting month view for ${date}...`);
    const monthData = await transactionService.getAggregatedTransactions(storeId, "month", date);
    console.log("Month Data total entries:", monthData.length);
    const hasMonthData = monthData.some(d => d.income > 0 || d.expense > 0);
    console.log("Has non-zero data in month view?", hasMonthData);

  } catch (err) {
    console.error("Test Error:", err);
  }
}

testChartData();
