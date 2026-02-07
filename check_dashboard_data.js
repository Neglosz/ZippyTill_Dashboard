import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cwvqefsiapnarjbugllt.supabase.co";
const supabaseKey = "sb_publishable_Dzttx4y51RaGTUeYB4gudg_eaV8daUW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("--- Checking Stores ---");
  const { data: stores, error: sError } = await supabase
    .from("stores")
    .select("id, name");
  if (sError) console.error("Store Error:", sError);
  else console.log("Stores:", stores);

  if (stores && stores.length > 0) {
    const firstStoreId = stores[0].id; // Try the first store
    console.log(
      `\n--- Checking Data for Store ID: ${firstStoreId} (${stores[0].name}) ---`,
    );

    // Orders
    const { data: orders, error: oError } = await supabase
      .from("orders")
      .select("id, order_no, total_amount")
      .eq("store_id", firstStoreId);
    console.log("Orders count:", orders?.length || 0);
    if (orders?.length > 0) console.log("Sample Order:", orders[0]);

    // Order Items
    const { data: items, error: iError } = await supabase
      .from("order_items")
      .select("id, order_id, product_id, qty")
      .returns();
    // Note: order_items doesn't have store_id directly in some schemas, let's see if we can get them via join
    const { data: joinedItems, error: jError } = await supabase
      .from("order_items")
      .select("id, orders!inner(store_id)")
      .eq("orders.store_id", firstStoreId);
    console.log("Joined Order Items count:", joinedItems?.length || 0);

    // Products
    const { data: products, error: pError } = await supabase
      .from("products")
      .select("id, name, stock_qty")
      .eq("store_id", firstStoreId);
    console.log("Products count:", products?.length || 0);
    if (products?.length > 0) console.log("Sample Product:", products[0]);
  }
}

checkData();
