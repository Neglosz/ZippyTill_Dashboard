const { supabase } = require("./backend/config/supabase");
const saleService = require("./backend/services/saleService");

async function test() {
  const branchId = "YOUR_BRANCH_ID_HERE"; // I need a real branch ID or I'll just check if it's null
  try {
    const summary = await saleService.getSalesSummary(branchId);
    console.log("Summary:", summary);
  } catch (err) {
    console.error("Error:", err);
  }
}

// I can't run this easily because I don't have the env vars or a real branch ID.
