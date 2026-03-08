const { supabase } = require("../config/supabase");

const promotionService = {
  getPromotions: async (storeId) => {
    if (!storeId) throw new Error("Store ID is required");
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(`*, promotion_items (count)`)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) return [];

      const promoIds = data.map((p) => p.id);

      // Fetch order_items associated with these promotions
      const { data: salesData, error: salesError } = await supabase
        .from("order_items")
        .select("promotion_id, subtotal, order_id")
        .in("promotion_id", promoIds);

      if (salesError) throw salesError;

      // Aggregate total_sales and distinct customers (orders) per promotion
      const promoStats = {};
      promoIds.forEach(
        (id) => (promoStats[id] = { total_sales: 0, order_ids: new Set() }),
      );

      if (salesData) {
        salesData.forEach((item) => {
          if (item.promotion_id && promoStats[item.promotion_id]) {
            promoStats[item.promotion_id].total_sales +=
              Number(item.subtotal) || 0;
            if (item.order_id)
              promoStats[item.promotion_id].order_ids.add(item.order_id);
          }
        });
      }

      return data.map((promo) => ({
        ...promo,
        itemCount: promo.promotion_items?.[0]?.count || 0,
        total_sales: promoStats[promo.id]?.total_sales || 0,
        customer_count: promoStats[promo.id]?.order_ids.size || 0,
      }));
    } catch (error) {
      throw error;
    }
  },

  getPromotionDetails: async (promotionId) => {
    if (!promotionId) throw new Error("Promotion ID is required");
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(`*, promotion_items (product:products (id, name, price))`)
        .eq("id", promotionId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  createPromotion: async (promoData, products) => {
    try {
      const { data: promo, error: promoError } = await supabase
        .from("promotions")
        .insert(promoData)
        .select()
        .single();
      if (promoError) throw promoError;
      const promoItems = products.map((p) => ({
        promotion_id: promo.id,
        product_id: p.id,
        is_active: "active",
      }));
      const { error: itemsError } = await supabase
        .from("promotion_items")
        .insert(promoItems);
      if (itemsError) throw itemsError;
      return promo;
    } catch (error) {
      throw error;
    }
  },

  updatePromotion: async (promotionId, promoData) => {
    if (!promotionId) throw new Error("Promotion ID is required");
    try {
      const { data, error } = await supabase
        .from("promotions")
        .update(promoData)
        .eq("id", promotionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  deletePromotion: async (promotionId, authHeader) => {
    console.log(`[promotionService] Attempting to delete promotion: ${promotionId}`);
    if (!promotionId) throw new Error("Promotion ID is required");

    // If authHeader is provided, use it to set the session for this request
    // This helps bypass RLS issues if the anon key is restricted
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await supabase.auth.setSession({ access_token: token, refresh_token: "" });
    }

    try {
      // 1. Set promotion_id to null in order_items to avoid foreign key constraint violation
      console.log(`[promotionService] Step 1: Clearing promotion_id in order_items for promo ${promotionId}`);
      const { data: updateData, error: updateError } = await supabase
        .from("order_items")
        .update({ promotion_id: null })
        .eq("promotion_id", promotionId)
        .select();
      
      if (updateError) {
        console.error("[promotionService] Error clearing promotion_id in order_items:", updateError);
      } else {
        console.log(`[promotionService] Successfully cleared promotion_id in ${updateData?.length || 0} order_items`);
      }

      // 2. Delete all promotion items to avoid foreign key constraints
      console.log(`[promotionService] Step 2: Deleting promotion_items for promo ${promotionId}`);
      const { error: itemsError } = await supabase
        .from("promotion_items")
        .delete()
        .eq("promotion_id", promotionId);
      if (itemsError) {
        console.error("[promotionService] Error deleting promotion_items:", itemsError);
        throw itemsError;
      }

      // 3. Then delete the promotion itself
      console.log(`[promotionService] Step 3: Deleting promotion ${promotionId}`);
      const { error: promoError } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);
      
      if (promoError) {
        console.error("[promotionService] Error deleting promotion:", promoError);
        throw promoError;
      }

      console.log(`[promotionService] Successfully deleted promotion ${promotionId}`);
      return true;
    } catch (error) {
      console.error("Error in deletePromotion:", error);
      throw error;
    }
  },

  deletePromotionItem: async (promotionId, productId) => {
    if (!promotionId || !productId) throw new Error("Promotion ID and Product ID are required");
    try {
      const { error } = await supabase
        .from("promotion_items")
        .delete()
        .eq("promotion_id", promotionId)
        .eq("product_id", productId);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  calculateEfficiency: (items, totalSales) => {
    return Math.floor(Math.random() * 40) + 60;
  },
};

module.exports = promotionService;
