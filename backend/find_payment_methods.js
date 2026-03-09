const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function findPaymentMethods() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("payment_method");

    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    }

    const methods = [...new Set(data.map(o => o.payment_method))];
    console.log("Found unique payment methods:", methods);
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

findPaymentMethods();
