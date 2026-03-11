require("dotenv").config({ path: "./backend/.env" });
const { supabase } = require("./backend/config/supabase");

async function checkSupabase() {
  console.log("Checking Supabase connection from backend config...");
  console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL);
  console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY || !!process.env.VITE_SUPABASE_ANON_KEY);

  try {
    const start = Date.now();
    const { data, error } = await supabase.from("stores").select("id").limit(1);
    const end = Date.now();
    
    if (error) {
      console.error("Supabase Error:", error.message);
    } else {
      console.log("Supabase Connection Successful!");
      console.log("Data fetched:", data);
      console.log("Time taken:", (end - start), "ms");
    }
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

checkSupabase();
