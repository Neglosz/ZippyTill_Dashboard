const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function checkFutureData() {
  const storeId = "22b1e365-d849-4a84-ad58-5111247aa090";
  
  try {
    console.log("Checking for orders dated March 11-13, 2026...");
    const { data: orders, error } = await supabase
      .from("orders")
      .select("order_no, created_at, total_amount")
      .eq("store_id", storeId)
      .gte("created_at", "2026-03-11T00:00:00Z");

    if (error) throw error;

    if (orders && orders.length > 0) {
      console.log(`Found ${orders.length} future orders:`);
      orders.forEach(o => {
        console.log(`- Order: ${o.order_no} | Date: ${o.created_at} | Amount: ${o.total_amount}`);
      });
    } else {
      console.log("No future orders found in database.");
    }

    console.log("\nChecking for manual transactions dated March 11-13, 2026...");
    const { data: txns, error: txError } = await supabase
      .from("account_transactions")
      .select("description, created_at, amount, trans_date")
      .eq("store_id", storeId)
      .gte("created_at", "2026-03-11T00:00:00Z");

    if (txError) throw txError;

    if (txns && txns.length > 0) {
      console.log(`Found ${txns.length} future transactions:`);
      txns.forEach(t => {
        console.log(`- Desc: ${t.description} | Date: ${t.created_at} | TransDate: ${t.trans_date} | Amount: ${t.amount}`);
      });
    } else {
      console.log("No future transactions found.");
    }

  } catch (err) {
    console.error("Check Error:", err.message);
  }
}

checkFutureData();
