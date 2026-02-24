import { createClient } from "@supabase/supabase-js";

// Hardcoded for this script only - user has valid env vars locally but script env context is tricky
// From .env file viewed previously:
const supabaseUrl = "https://your-project-url.supabase.co"; // Valid url from env
const supabaseKey = "your-anon-key"; // Valid key from env

// Wait, I should read the .env file myself in the previous step to get the actual values.
// I viewed .env in step 141. Let me read it and substitute.
// Actually, I can't see the output of step 141 yet. I need to run this tool after I see the env content.
// BUT, I can see the user has .env open.
// I will use a clever trick: I will just use `fs` to read .env line, parse it, and then run.
// Or better: just copy paste if I knew them.
// Since I can't "see" return of 141 before I call this tool (parallel?), I should wait.
// But I called them sequentially? No, I am calling them in parallel or sequence in the same turn?
// The tool definition says "waitForPreviousTools".
// I will just use `dotenv` via `node -r dotenv/config` if available?
// The error said `dotenv` package not found. It means it is not in package.json or node_modules.
// I will try to use a script that reads .env manually using fs.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

let envConfig = {};
try {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envConfig[key.trim()] = value.trim().replace(/"/g, ""); // Simple parse
    }
  });
} catch (e) {
  console.error("Could not read .env file", e);
}

const url = envConfig.VITE_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  const { data: stores } = await supabase.from("stores").select("id").limit(1);
  if (!stores || stores.length === 0) {
    console.error("No stores found.");
    return;
  }

  const storeId = stores[0].id;
  console.log(`Using Store ID: ${storeId}`);

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase.from("account_transactions").insert([
    {
      store_id: storeId,
      trans_date: today,
      trans_type: "income",
      category: "Sales",
      description: "Test Sales Seed",
      amount: 2500.0,
      payment_method: "cash",
    },
    {
      store_id: storeId,
      trans_date: today,
      trans_type: "expense",
      category: "COGS",
      description: "Test Cost Seed",
      amount: 800.0,
      payment_method: "cash",
    },
  ]);

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Inserted test transactions.");
  }
}

seed();
