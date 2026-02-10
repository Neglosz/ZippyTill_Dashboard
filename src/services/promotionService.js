import { supabase } from "../lib/supabase";

export const promotionService = {
  getPromotions: async (storeId) => {
    if (!storeId) throw new Error("Store ID is required");

    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(
          `
          *,
          promotion_items (count)
        `,
        )
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map data to match UI expectations if needed,
      // or we can adjust UI to match generic DB fields
      return data.map((promo) => ({
        ...promo,
        itemCount: promo.promotion_items?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error("promotionService getPromotions error:", error);
      throw error;
    }
  },

  getPromotionDetails: async (promotionId) => {
    if (!promotionId) throw new Error("Promotion ID is required");

    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(
          `
          *,
          promotion_items (
            product:products (id, name, price)
          )
        `,
        )
        .eq("id", promotionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("promotionService getPromotionDetails error:", error);
      throw error;
    }
  },

  createPromotion: async (promoData, products) => {
    try {
      // 1. Insert promotion
      const { data: promo, error: promoError } = await supabase
        .from("promotions")
        .insert(promoData)
        .select()
        .single();

      if (promoError) throw promoError;

      // 2. Insert promotion items
      const promoItems = products.map((p) => ({
        promotion_id: promo.id,
        product_id: p.id,
        is_active: true,
      }));

      const { error: itemsError } = await supabase
        .from("promotion_items")
        .insert(promoItems);

      if (itemsError) throw itemsError;

      return promo;
    } catch (error) {
      console.error("promotionService createPromotion error:", error);
      throw error;
    }
  },

  calculateEfficiency: (items, totalSales) => {
    // This is a mock function for now, need actual sales data
    return Math.floor(Math.random() * 40) + 60; // Returns 60-100%
  },
};
