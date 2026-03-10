const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function cleanupFutureData() {
  const storeId = "22b1e365-d849-4a84-ad58-5111247aa090";
  const cutOffDate = "2026-03-10T23:59:59Z"; // End of today in UTC-ish (Thai 07:00 next day)
  // Actually, let's use Thai Time 2026-03-11 00:00:00 which is 2026-03-10 17:00:00 UTC
  const thaiNextDayStartInUTC = "2026-03-10T17:00:00Z";

  try {
    console.log("Step 1: Finding future orders...");
    const { data: futureOrders, error: findError } = await supabase
      .from("orders")
      .select("id")
      .eq("store_id", storeId)
      .gte("created_at", thaiNextDayStartInUTC);

    if (findError) throw findError;

    if (futureOrders && futureOrders.length > 0) {
      const orderIds = futureOrders.map(o => o.id);
      console.log(`Found ${orderIds.length} future orders. Cleaning up linked data...`);

      // Delete order items
      await supabase.from("order_items").delete().in("order_id", orderIds);
      // Delete payments
      await supabase.from("payments").delete().in("order_id", orderIds);
      // Delete orders
      const { error: delOrderError } = await supabase.from("orders").delete().in("id", orderIds);
      
      if (delOrderError) console.error("Error deleting orders:", delOrderError.message);
      else console.log("Successfully deleted future orders.");
    } else {
      console.log("No future orders found.");
    }

    console.log("\nStep 2: Cleaning up future account transactions...");
    const { error: delTxError } = await supabase
      .from("account_transactions")
      .delete()
      .eq("store_id", storeId)
      .gte("created_at", thaiNextDayStartInUTC);

    if (delTxError) console.error("Error deleting transactions:", delTxError.message);
    else console.log("Successfully deleted future transactions.");

    console.log("\nCleanup Complete! Please refresh your browser.");

  } catch (err) {
    console.error("Cleanup Failed:", err.message);
  }
}

cleanupFutureData();
