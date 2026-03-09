const { supabase } = require("../config/supabase");

const orderService = {
  async createOrder(orderData, items, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // 1. Fetch active promotions for this branch to auto-link items
    const now = new Date().toISOString().split("T")[0]; // date-only for correct comparison with start_date/end_date
    const { data: activePromos } = await supabase
      .from("promotions")
      .select(`id, promotion_items (product_id)`)
      .eq("store_id", branchId)
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now);

    // Create a lookup map: product_id -> promotion_id
    const promoLookup = {};
    if (activePromos) {
      activePromos.forEach((promo) => {
        if (promo.promotion_items) {
          promo.promotion_items.forEach((pi) => {
            // If a product is in multiple promotions, the latest one takes precedence
            promoLookup[pi.product_id] = promo.id;
          });
        }
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_no: orderData.orderNo,
          total_amount: orderData.totalAmount,
          payment_status: orderData.paymentStatus || "pending",
          user_id: orderData.userId,
          customer_id: orderData.customerId,
          store_id: branchId,
        },
      ])
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      qty: item.qty,
      price_per_unit: item.price,
      subtotal: item.qty * item.price,
      // Use promotionId from frontend if provided, otherwise fallback to auto-lookup
      promotion_id: item.promotionId || promoLookup[item.productId] || null,
    }));
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) throw itemsError;
    const stockUpdates = items.map((item) => {
      return supabase
        .rpc("decrement_stock", {
          p_id: item.productId,
          p_qty: item.qty,
          p_store_id: branchId,
        })
        .then(({ error }) => {
          if (error) {
            return supabase
              .from("products")
              .select("stock_qty")
              .eq("id", item.productId)
              .eq("store_id", branchId)
              .single()
              .then(({ data }) => {
                if (data)
                  return supabase
                    .from("products")
                    .update({
                      stock_qty: Math.max(0, data.stock_qty - item.qty),
                    })
                    .eq("id", item.productId)
                    .eq("store_id", branchId);
              });
          }
        });
    });
    await Promise.all(stockUpdates);
    return order;
  },

  async getRecentOrders(storeId) {
    if (!storeId) throw new Error("Store ID is required");
    const { data, error } = await supabase
      .from("orders")
      .select(
        `*, customers_info (name, phone), order_items (*, products (name, image_url)), payments(method, tendered_amount, change_amount)`,
      )
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async getOrderDetails(orderId, branchId) {
    if (!branchId) throw new Error("Branch ID is required");
    const { data, error } = await supabase
      .from("orders")
      .select(
        `*, order_items (*, products (name, barcode, unit_type, is_weightable)), customers_info (name, phone), payments(method, tendered_amount, change_amount)`,
      )
      .eq("id", orderId)
      .eq("store_id", branchId)
      .single();
    if (error) throw error;
    return data;
  },
};

module.exports = orderService;
