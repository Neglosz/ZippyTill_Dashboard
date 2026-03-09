const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function findPaymentTypes() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("payment_type");

    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    }

    const types = [...new Set(data.map(o => o.payment_type))];
    console.log("Found unique payment types:", types);
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

findPaymentTypes();
