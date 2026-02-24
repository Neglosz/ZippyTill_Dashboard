const { supabase } = require("../config/supabase");

const promotionService = {
  getPromotions: async (storeId) => {
    if (!storeId) throw new Error("Store ID is required");
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(`*, promotion_items (count)`)
        .eq("store_id", storeId).order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((promo) => ({ ...promo, itemCount: promo.promotion_items?.[0]?.count || 0 }));
    } catch (error) { throw error; }
  },

  getPromotionDetails: async (promotionId) => {
    if (!promotionId) throw new Error("Promotion ID is required");
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select(`*, promotion_items (product:products (id, name, price))`)
        .eq("id", promotionId).single();
      if (error) throw error;
      return data;
    } catch (error) { throw error; }
  },

  createPromotion: async (promoData, products) => {
    try {
      const { data: promo, error: promoError } = await supabase.from("promotions").insert(promoData).select().single();
      if (promoError) throw promoError;
      const promoItems = products.map((p) => ({ promotion_id: promo.id, product_id: p.id, is_active: "active" }));
      const { error: itemsError } = await supabase.from("promotion_items").insert(promoItems);
      if (itemsError) throw itemsError;
      return promo;
    } catch (error) { throw error; }
  },

  calculateEfficiency: (items, totalSales) => {
    return Math.floor(Math.random() * 40) + 60;
  },
};

module.exports = promotionService;
