// Load environment variables from .env file relative to this script
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function patchPromotionSales() {
  console.log("🚀 Starting Promotion Sales Patch...");

  try {
    // 1. Get all promotions and their items
    const { data: promotions, error: promoErr } = await supabase
      .from("promotions")
      .select(`id, store_id, promotion_items (product_id)`);

    if (promoErr) throw promoErr;
    if (!promotions || promotions.length === 0) {
      console.log("⚠️ No promotions found to patch.");
      return;
    }

    console.log(`📦 Found ${promotions.length} promotions. Analyzing sales...`);

    let totalPatched = 0;

    for (const promo of promotions) {
      const productIds = promo.promotion_items.map(pi => pi.product_id);
      if (productIds.length === 0) continue;

      // 2. Find order_items that belong to this store and match these products, but have no promotion_id
      // We join with orders to ensure we only update items from the correct store
      const { data: itemsToUpdate, error: itemsErr } = await supabase
        .from("order_items")
        .select(`id, product_id, orders!inner(store_id)`)
        .eq("orders.store_id", promo.store_id)
        .in("product_id", productIds)
        .is("promotion_id", null);

      if (itemsErr) {
        console.error(`❌ Error fetching items for promo ${promo.id}:`, itemsErr);
        continue;
      }

      if (itemsToUpdate && itemsToUpdate.length > 0) {
        const itemIds = itemsToUpdate.map(item => item.id);
        
        // 3. Update these items with the promotion_id
        const { error: updateErr } = await supabase
          .from("order_items")
          .update({ promotion_id: promo.id })
          .in("id", itemIds);

        if (updateErr) {
          console.error(`❌ Failed to update ${itemIds.length} items for promo ${promo.id}:`, updateErr);
        } else {
          console.log(`✅ Linked ${itemIds.length} sales items to Promotion: ${promo.id}`);
          totalPatched += itemIds.length;
        }
      }
    }

    console.log(`
✨ Patch Completed! Total items linked: ${totalPatched}`);
    console.log("📊 You can now refresh the AI Promotion page to see the updated sales.");

  } catch (err) {
    console.error("💥 Critical Error during patch:", err.message);
  }
}

patchPromotionSales();
