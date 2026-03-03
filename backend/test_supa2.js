require("dotenv").config();
const { supabase } = require("./config/supabase");

async function test() {
  const branchId = "8a22ee41-ca61-4a2e-ac0a-fdfdcd2ee646";

  const { data: lowStockProducts, error: thresholdError } = await supabase.rpc(
    "get_low_stock_products",
    { p_store_id: branchId },
  );

  console.log("Error:", thresholdError);
  console.log("Data:", lowStockProducts);
}

test();
