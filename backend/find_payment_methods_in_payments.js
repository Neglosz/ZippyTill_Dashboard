const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function findPaymentMethodsInPayments() {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("method");

    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    }

    const methods = [...new Set(data.map(p => p.method))];
    console.log("Found unique payment methods in payments table:", methods);
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

findPaymentMethodsInPayments();
