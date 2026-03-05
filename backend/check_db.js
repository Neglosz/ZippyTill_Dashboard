const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function checkRecentOrders() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("order_no, payment_status, payment_type")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    }

    console.log("Recent Orders Payment Info:");
    orders.forEach(o => {
      console.log(`Order: ${o.order_no} | Status: ${o.payment_status} | Type: ${o.payment_type}`);
    });
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

checkRecentOrders();
