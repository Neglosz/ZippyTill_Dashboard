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

  deletePromotion: async (promotionId) => {
    if (!promotionId) throw new Error("Promotion ID is required");
    try {
      // First delete all promotion items to avoid foreign key constraints
      const { error: itemsError } = await supabase
        .from("promotion_items")
        .delete()
        .eq("promotion_id", promotionId);
      if (itemsError) throw itemsError;

      // Then delete the promotion itself
      const { error: promoError } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);
      if (promoError) throw promoError;

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
