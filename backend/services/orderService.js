const { supabase } = require("../config/supabase");
const notificationService = require("./notificationService");

const orderService = {
  async createOrder(orderData, items, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // TC018: Block selling expired products
    const today = new Date().toISOString().split("T")[0];
    
    for (const item of items) {
      // Check if product has any non-expired batches with stock
      const { data: validBatches, error: batchError } = await supabase
        .from("product_batches")
        .select("id, remaining_qty, expire_date")
        .eq("product_id", item.productId)
        .gt("expire_date", today)
        .gt("remaining_qty", 0);

      if (batchError) throw batchError;

      // If no valid batches found but product is being sold, check if it's completely expired
      if (!validBatches || validBatches.length === 0) {
        const { data: product } = await supabase
          .from("products")
          .select("name")
          .eq("id", item.productId)
          .single();
          
        throw new Error(`ไม่สามารถขายสินค้า "${product?.name || item.productId}" ได้เนื่องจากสินค้าหมดอายุแล้ว`);
      }
    }

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

    // Process Stock Updates and Check for Notifications
    const stockUpdates = items.map(async (item) => {
      try {
        const { error: rpcError } = await supabase.rpc("decrement_stock", {
          p_id: item.productId,
          p_qty: item.qty,
          p_store_id: branchId,
        });

        // Fallback to manual decrement if RPC fails
        if (rpcError) {
          const { data: pData } = await supabase
            .from("products")
            .select("stock_qty")
            .eq("id", item.productId)
            .eq("store_id", branchId)
            .single();
          
          if (pData) {
            await supabase
              .from("products")
              .update({ stock_qty: Math.max(0, pData.stock_qty - item.qty) })
              .eq("id", item.productId)
              .eq("store_id", branchId);
          }
        }

        // Check for Low Stock / Out of Stock after decrement
        const { data: product } = await supabase
          .from("products")
          .select("name, stock_qty, low_stock_threshold, unit_type")
          .eq("id", item.productId)
          .single();

        if (product) {
          if (product.stock_qty <= 0) {
            await notificationService.createNotification(branchId, 'out_of_stock', `สินค้า "${product.name}" หมดสต็อกแล้ว`, { productId: item.productId });
          } else if (product.low_stock_threshold && product.stock_qty <= product.low_stock_threshold) {
            await notificationService.createNotification(branchId, 'low_stock', `สินค้า "${product.name}" เหลือเพียง ${product.stock_qty} ${product.unit_type || 'ชิ้น'}`, { productId: item.productId, currentQty: product.stock_qty });
          }
        }
      } catch (err) {
        console.error("[Stock Update] Failed for product:", item.productId, err.message);
      }
    });

    await Promise.all(stockUpdates);

    // Record in account_transactions for unified ledger
    // Only record as income if it's not a credit sale or if it's already paid
    if (!(orderData.paymentStatus === "pending" && orderData.paymentMethod === "credit_sale")) {
      try {
        await supabase.from("account_transactions").insert([
          {
            store_id: branchId,
            amount: orderData.totalAmount,
            trans_type: "income",
            category: "sales",
            description: `ขายสินค้า เลขที่ ${order.order_no}`,
            reference_order_id: order.id,
            trans_date: new Date().toISOString().split("T")[0],
            payment_method: orderData.paymentMethod || "cash",
          },
        ]);
      } catch (err) {
        console.error("[Account Transaction] Failed to record sale:", err.message);
      }
    }

    return order;
  },

  async getRecentOrders(storeId, date) {
    if (!storeId) throw new Error("Store ID is required");
    
    let query = supabase
      .from("orders")
      .select(
        `*, customers_info (name, phone), order_items (*, products (name, image_url)), payments(method, tendered_amount, change_amount)`,
      )
      .eq("store_id", storeId);

    // Filter by date if provided (YYYY-MM-DD, YYYY-MM, or YYYY)
    if (date) {
      let start, end;
      if (date.length === 4) {
        // YYYY
        start = `${date}-01-01T00:00:00.000Z`;
        end = `${date}-12-31T23:59:59.999Z`;
      } else if (date.length === 7) {
        // YYYY-MM
        const year = parseInt(date.substring(0, 4));
        const month = parseInt(date.substring(5, 7)) - 1;
        const lastDay = new Date(year, month + 1, 0).getDate();
        start = `${date}-01T00:00:00.000Z`;
        end = `${date}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;
      } else {
        // YYYY-MM-DD
        // Use local day range (without Z) to match store's local time
        start = `${date}T00:00:00`;
        end = `${date}T23:59:59`;
      }
      query = query.gte("created_at", start).lte("created_at", end);
    }

    const { data, error } = await query
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
