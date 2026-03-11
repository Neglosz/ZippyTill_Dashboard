const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend", ".env") });

console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("VITE_SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
