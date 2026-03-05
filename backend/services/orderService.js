const { supabase } = require("../config/supabase");

const orderService = {
  async createOrder(orderData, items, branchId) {
    if (!branchId) throw new Error("Branch ID is required");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ order_no: orderData.orderNo, total_amount: orderData.totalAmount, payment_status: orderData.paymentStatus || "pending", user_id: orderData.userId, customer_id: orderData.customerId, store_id: branchId }])
      .select().single();
    if (orderError) throw orderError;
    const orderItems = items.map((item) => ({ order_id: order.id, product_id: item.productId, qty: item.qty, price_per_unit: item.price, subtotal: item.qty * item.price }));
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;
    const stockUpdates = items.map((item) => {
      return supabase.rpc("decrement_stock", { p_id: item.productId, p_qty: item.qty, p_store_id: branchId })
        .then(({ error }) => {
          if (error) {
            return supabase.from("products").select("stock_qty").eq("id", item.productId).eq("store_id", branchId).single()
              .then(({ data }) => { if (data) return supabase.from("products").update({ stock_qty: Math.max(0, data.stock_qty - item.qty) }).eq("id", item.productId).eq("store_id", branchId); });
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
      .select(`*, customers_info (name, phone), order_items (*, products (name, image_url), promotions(id, name, description)), payments(tendered_amount, change_amount)`)
      .eq("store_id", storeId).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return data;
  },

  async getOrderDetails(orderId, branchId) {
    if (!branchId) throw new Error("Branch ID is required");
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (*, products (name, barcode, unit_type, is_weightable), promotions(id, name, description)), customers_info (name, phone), payments(tendered_amount, change_amount)`)
      .eq("id", orderId).eq("store_id", branchId).single();
    if (error) throw error;
    return data;
  },
};

module.exports = orderService;
