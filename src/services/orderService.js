import { supabase } from "../lib/supabase";

export const orderService = {
  // Create a full order transaction
  async createOrder(orderData, items) {
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

    return order;
  },

  // Get recent orders
  async getRecentOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  // Get single order details
  async getOrderDetails(orderId) {
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
      `
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  },
};
