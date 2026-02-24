/**
 * Script to seed account_transactions table with sample data
 * Run this script with: node scripts/seedAccountTransactions.js
 */

import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_KEY";

const supabase = createClient(supabaseUrl, supabaseKey);

// Replace with your actual store_id
const STORE_ID = "YOUR_STORE_ID"; // Get this from your Supabase stores table

async function seedTransactions() {
  console.log("🌱 Starting to seed account_transactions...\n");

  const today = new Date();
  const transactions = [];

  // Generate data for the past 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    // Random number of transactions per day (3-8)
    const numTransactions = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < numTransactions; i++) {
      // 70% income, 30% expense
      const isIncome = Math.random() < 0.7;

      if (isIncome) {
        // Income transactions (sales)
        const amount = Math.floor(Math.random() * 2000) + 100; // 100-2100 baht
        transactions.push({
          store_id: STORE_ID,
          trans_date: dateStr,
          trans_type: "income",
          amount: amount,
          category: "sales",
          description: `ขายสินค้า - วันที่ ${dateStr}`,
        });
      } else {
        // Expense transactions
        const expenseCategories = [
          { category: "COGS", min: 50, max: 500 },
          { category: "utilities", min: 100, max: 300 },
          { category: "salary", min: 500, max: 1000 },
          { category: "supplies", min: 50, max: 200 },
        ];
        const expense =
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ];
        const amount =
          Math.floor(Math.random() * (expense.max - expense.min)) + expense.min;

        transactions.push({
          store_id: STORE_ID,
          trans_date: dateStr,
          trans_type: "expense",
          amount: amount,
          category: expense.category,
          description: `${expense.category} - วันที่ ${dateStr}`,
        });
      }
    }
  }

  console.log(`📊 Generated ${transactions.length} transactions\n`);

  // Insert in batches of 50
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from("account_transactions")
      .insert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(
        `✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`,
      );
    }
  }

  console.log("\n📈 Seeding complete!");
  console.log(`   ✅ Success: ${successCount} records`);
  console.log(`   ❌ Failed: ${errorCount} records`);
}

// Check if STORE_ID is set
if (STORE_ID === "YOUR_STORE_ID") {
  console.log("⚠️  Please set STORE_ID before running this script.");
  console.log(
    "   You can get your store_id from the Supabase 'stores' table.\n",
  );
  console.log("   Example:");
  console.log('   const STORE_ID = "your-actual-store-uuid";\n');
  process.exit(1);
}

seedTransactions().catch(console.error);
