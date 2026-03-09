const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function inspectPayments() {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase Error:", error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log("Found row in payments! Available columns:", Object.keys(data[0]).join(', '));
      console.log("Sample data:", data[0]);
    } else {
      console.log("Table 'payments' is empty.");
    }
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

inspectPayments();
