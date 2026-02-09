import { supabase } from "../lib/supabase";

export const orderService = {
  // Create a full order transaction with branchId
  async createOrder(orderData, items, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // 1. Create Order Record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_no: orderData.orderNo,
          total_amount: orderData.totalAmount,
          payment_status: orderData.paymentStatus || "pending",
          user_id: orderData.userId, // Employee who made the sale
          customer_id: orderData.customerId,
          store_id: branchId,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create Order Items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      qty: item.qty,
      price_per_unit: item.price,
      subtotal: item.qty * item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Update Inventory (Decrease stock_qty) - Scoped to branch for safety
    const stockUpdates = items.map((item) => {
      return supabase
        .rpc("decrement_stock", {
          p_id: item.productId,
          p_qty: item.qty,
          p_store_id: branchId, // Assuming RPC is updated or used in context
        })
        .then(({ error }) => {
          if (error) {
            console.warn(
              "RPC decrement_stock failed, falling back to manual update",
              error,
            );
            return supabase
              .from("products")
              .select("stock_qty")
              .eq("id", item.productId)
              .eq("store_id", branchId)
              .single()
              .then(({ data }) => {
                if (data) {
                  return supabase
                    .from("products")
                    .update({
                      stock_qty: Math.max(0, data.stock_qty - item.qty),
                    })
                    .eq("id", item.productId)
                    .eq("store_id", branchId);
                }
              });
          }
        });
    });

    // Wait for all inventory updates to complete
    await Promise.all(stockUpdates);

    return order;
  },

  // Get recent orders for a specific branch
  async getRecentOrders(storeId) {
    if (!storeId) throw new Error("Store ID is required");

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers_info (name),
        order_items (
          *,
          products (name, image_url)
        )
      `,
      )
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  // Get single order details (scoped to branch for safety)
  async getOrderDetails(orderId, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (name, barcode)
        ),
        customers (name, phone)
      `,
      )
      .eq("id", orderId)
      .eq("store_id", branchId)
      .single();

    if (error) throw error;
    return data;
  },
};
