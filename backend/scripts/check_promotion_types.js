const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function checkPromotionTypes() {
  try {
    // 1. Fetch a valid store_id
    const { data: stores, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .limit(1);

    if (storeError || !stores || stores.length === 0) {
      console.error("Could not fetch a store_id:", storeError?.message || "No stores found");
      return;
    }

    const storeId = stores[0].id;
    console.log(`Using store_id: ${storeId}`);

    // Try to get a sample promotion to see columns
    const { data: samplePromos } = await supabase
      .from("promotions")
      .select("*")
      .limit(1);
    
    let samplePromoColumns = [];
    if (samplePromos && samplePromos.length > 0) {
      samplePromoColumns = Object.keys(samplePromos[0]);
      console.log("Found sample promotion columns:", samplePromoColumns.join(', '));
    } else {
      console.log("No promotions found to inspect columns.");
    }

    const typesToTest = ['discount_percent', 'discount_amount', 'buy_x_get_y', 'bundle', 'custom', 'amount', 'percent'];
    const results = [];
    const insertedIds = [];

    for (const type of typesToTest) {
      console.log(`Testing type: ${type}...`);
      const dummyPromo = {
        store_id: storeId,
        name: `Test Promo ${type}`,
        type: type,
        description: `Dummy promotion for type ${type}`,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
        is_active: 'active'
      };

      // Add common columns if missing from base dummy object but present in sample
      // For example: value, status, etc.
      // Based on typical promotion tables
      if (samplePromoColumns.includes('value')) dummyPromo.value = 10;
      if (samplePromoColumns.includes('status')) dummyPromo.status = 'active';

      const { data, error } = await supabase
        .from("promotions")
        .insert(dummyPromo)
        .select();

      if (error) {
        results.push({ type, status: 'FAILED', error: error.message });
        console.log(`  Result: FAILED - ${error.message}`);
      } else {
        results.push({ type, status: 'SUCCESS' });
        console.log(`  Result: SUCCESS`);
        if (data && data[0]) {
          insertedIds.push(data[0].id);
        }
      }
    }

    console.log("\nSummary Results:");
    results.forEach(res => {
      console.log(`${res.type.padEnd(20)}: ${res.status}${res.error ? ` - ${res.error}` : ''}`);
    });

    // Clean up
    if (insertedIds.length > 0) {
      console.log(`\nCleaning up ${insertedIds.length} promotions...`);
      const { error: deleteError } = await supabase
        .from("promotions")
        .delete()
        .in("id", insertedIds);
      
      if (deleteError) {
        console.error("Cleanup error:", deleteError.message);
      } else {
        console.log("Cleanup successful.");
      }
    }

  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

checkPromotionTypes();
