const { supabase } = require("../../core/config/supabase");
const { sanitizeHTML } = require("../../core/utils/sanitizer");

const productService = {
  // Get all products with category info for a specific branch
  async getAllProducts(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_categories (
          name
        ),
        product_batches (
          expire_date
        )
      `,
      )
      .eq("store_id", branchId)
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get single product (still scoped to branch for safety)
  async getProductById(id, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("store_id", branchId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new product with branchId
  async createProduct(productData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const initialQty = Number(productData.stockQty || 0);

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          barcode: sanitizeHTML(productData.barcode),
          name: sanitizeHTML(productData.name),
          category_id: productData.categoryId,
          price: productData.price,
          cost_price: productData.costPrice,
          stock_qty: initialQty,
          unit_type: sanitizeHTML(productData.unitType || "ชิ้น"),
          is_weightable: productData.isWeightable || false,
          low_stock_threshold: productData.lowStockThreshold || 0,
          image_url: productData.image_url,
          store_id: branchId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create initial batch if expireDate is provided
    if (productData.expireDate && data?.id) {
      await supabase.from("product_batches").insert({
        product_id: data.id,
        expire_date: productData.expireDate,
        initial_qty: initialQty,
        remaining_qty: initialQty,
        batch_no: `BATCH-${Date.now()}`
      });
    }

    return data;
  },

  // Update product
  async updateProduct(id, productData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // Explicitly map allowed product columns
    const updateData = {};
    if (productData.name !== undefined) updateData.name = sanitizeHTML(productData.name);
    if (productData.barcode !== undefined) updateData.barcode = sanitizeHTML(productData.barcode);

    const categoryId = productData.categoryId || productData.category_id;
    if (categoryId !== undefined) updateData.category_id = categoryId;

    if (productData.price !== undefined) updateData.price = Number(productData.price);

    const costPrice = productData.costPrice || productData.cost_price;
    if (costPrice !== undefined) updateData.cost_price = Number(costPrice);

    const stockQty = productData.stockQty || productData.stock_qty;
    if (stockQty !== undefined) updateData.stock_qty = Number(stockQty);

    if (productData.image_url !== undefined) updateData.image_url = productData.image_url;

    const lowStockThreshold = productData.lowStockThreshold || productData.low_stock_threshold;
    if (lowStockThreshold !== undefined) updateData.low_stock_threshold = Number(lowStockThreshold);

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .eq("store_id", branchId)
      .select()
      .single();

    if (error) throw error;

    // Handle batch update if expireDate is provided
    const expireDate = productData.expireDate;
    if (expireDate) {
      const { data: batches } = await supabase
        .from("product_batches")
        .select("*")
        .eq("product_id", id)
        .order("expire_date", { ascending: false });

      if (batches && batches.length > 0) {
        // Update the most recent batch
        await supabase
          .from("product_batches")
          .update({ expire_date: expireDate })
          .eq("id", batches[0].id);
      } else {
        // Create a new batch if none exists
        await supabase.from("product_batches").insert({
          product_id: id,
          expire_date: expireDate,
          initial_qty: data.stock_qty || 0,
          remaining_qty: data.stock_qty || 0,
          batch_no: `BATCH-${Date.now()}`
        });
      }
    }

    return data;
  },

  // Soft delete product
  async deleteProduct(id, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // TC101: Check if product is in any pending orders
    const { data: pendingOrders, error: checkError } = await supabase
      .from("order_items")
      .select("id, orders!inner(id, payment_status, store_id)")
      .eq("product_id", id)
      .eq("orders.store_id", branchId)
      .eq("orders.payment_status", "pending");

    if (checkError) throw checkError;

    if (pendingOrders && pendingOrders.length > 0) {
      throw new Error("ไม่สามารถลบได้เนื่องจากสินค้าอยู่ในออเดอร์ที่ยังไม่ชำระเงิน");
    }

    // Fetch product info for logging before delete
    const { data: product } = await supabase
      .from("products")
      .select("name, stock_qty, image_url")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", branchId);

    if (error) throw error;

    // Automatically record stock removal history (Moved from frontend)
    if (product) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("inventory_transactions").insert({
        product_id: id,
        trans_type: "out",
        qty: product.stock_qty || 0,
        reference_type: "product_deletion",
        notes: "ลบสินค้าออกจากระบบ (อัตโนมัติ)",
        store_id: branchId,
        created_by: userData?.user?.id,
        created_at: new Date().toISOString(),
      });
    }

    return true;
  },

  // Get all categories
  async getAllCategories(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("product_categories")
      .select("id, name, category_type")
      .eq("store_id", branchId)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Create category
  async createCategory(categoryName, branchId, categoryType = "general") {
    if (!branchId) throw new Error("Branch ID is required");
    if (!categoryName) throw new Error("Category name is required");

    const { data, error } = await supabase
      .from("product_categories")
      .insert({
        name: sanitizeHTML(categoryName),
        store_id: branchId,
        category_type: categoryType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProductBatches(productId) {
    const { data, error } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", productId)
      .order("expire_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDashboardNotifications(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

    // TC015: Include today in expired (<= today)
    const { data: expiredData, error: expiredError } = await supabase
      .from("product_batches")
      .select("*, products!inner(id, name, store_id, image_url, deleted_at)")
      .eq("products.store_id", branchId)
      .lte("expire_date", today)
      .gt("remaining_qty", 0)
      .is("products.deleted_at", null);

    if (expiredError) throw expiredError;

    // TC015: Soon data starts from tomorrow (> today)
    const { data: soonData, error: soonError } = await supabase
      .from("product_batches")
      .select("*, products!inner(id, name, store_id, image_url, deleted_at)")
      .eq("products.store_id", branchId)
      .gt("expire_date", today)
      .lte("expire_date", thirtyDaysStr)
      .is("products.deleted_at", null)
      .gt("remaining_qty", 0);

    if (soonError) throw soonError;

    const { data: allProducts, error: thresholdError } = await supabase
      .from("products")
      .select("id, name, image_url, stock_qty, unit_type, low_stock_threshold")
      .eq("store_id", branchId)
      .is("deleted_at", null);

    if (thresholdError) throw thresholdError;

    const lowStockProducts = (allProducts || []).filter(
      (p) =>
        (p.low_stock_threshold && p.stock_qty <= p.low_stock_threshold) ||
        p.stock_qty <= 5,
    );

    const formatBatch = (batch) => {
      // TC021: Improved day calculation
      const expParts = batch.expire_date.split('-');
      const expDate = new Date(expParts[0], expParts[1] - 1, expParts[2]);
      expDate.setHours(0, 0, 0, 0);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      return {
        batchId: batch.id,
        productId: batch.product_id,
        name: batch.products?.name || "Unknown Product",
        imageUrl: batch.products?.image_url,
        expiryDate: new Date(batch.expire_date).toLocaleDateString("th-TH"),
        days: Math.abs(diffDays),
        rawExpiry: batch.expire_date
      };
    };

    const notificationService = require("../../core/services/notificationService");

    // TC017: Sort by urgency (ascending expiry date)
    const notifications = {
      expired: (expiredData || [])
        .map(formatBatch)
        .sort((a, b) => new Date(a.rawExpiry) - new Date(b.rawExpiry)),
      expiringSoon: (soonData || [])
        .map(formatBatch)
        .sort((a, b) => new Date(a.rawExpiry) - new Date(b.rawExpiry)),
      lowStock: (lowStockProducts || []).map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.image_url,
        qty: p.stock_qty,
        unit: p.unit_type || "ชิ้น",
        threshold: p.low_stock_threshold,
      })),
    };

    const lowStockToNotify = notifications.lowStock.slice(0, 10);
    for (const p of lowStockToNotify) {
      try {
        await notificationService.createNotification(
          branchId,
          "low_stock",
          `สินค้า ${p.name} เหลือเพียง ${p.qty} ${p.unit}`,
          { productId: p.id, qty: p.qty, threshold: p.threshold }
        );
      } catch (err) {
        console.error(`Failed to create low stock notification for ${p.name}:`, err.message);
      }
    }

    const expiringToNotify = soonData ? soonData.slice(0, 10) : [];
    for (const b of expiringToNotify) {
      try {
        await notificationService.createNotification(
          branchId,
          "expiry",
          `สินค้า ${b.products?.name} จะหมดอายุใน ${formatBatch(b).days} วัน (${formatBatch(b).expiryDate})`,
          { productId: b.product_id, batchId: b.id, expiryDate: b.expire_date }
        );
      } catch (err) {
        console.error(`Failed to create expiry notification for ${b.products?.name}:`, err.message);
      }
    }

    return notifications;
  },

  async getStockMovements(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data: sales, error: salesError } = await supabase
      .from("order_items")
      .select(`
        id,
        qty,
        products (name, image_url),
        orders!inner(created_at, store_id, order_no, payment_status)
      `)
      .eq("orders.store_id", branchId)
      .neq("orders.payment_status", "cancelled")
      .order("orders(created_at)", { ascending: false });

    if (salesError) throw salesError;

    const movements = (sales || []).map((item) => ({
      id: `SALE-${item.id}`,
      created_at: item.orders?.created_at,
      product: item.products?.name || "ไม่ทราบชื่อสินค้า",
      imageUrl: item.products?.image_url,
      type: "OUT",
      qty: item.qty,
      reference_type: "sale",
      note: `ออเดอร์ #${item.orders?.order_no || "N/A"}`,
    }));

    const { data: inventoryTxns, error: txnError } = await supabase
      .from("inventory_transactions")
      .select(`
        id,
        qty,
        trans_type,
        reference_type,
        notes,
        created_at,
        products!inner(name, image_url, store_id)
      `)
      .eq("store_id", branchId)
      .order("created_at", { ascending: false });

    if (txnError) {
      console.warn("Could not fetch inventory transactions:", txnError);
    }

    const inventoryMovements = (inventoryTxns || []).map((item) => ({
      id: `TXN-${item.id}`,
      created_at: item.created_at,
      product: item.products?.name || "ได้ลบสินค้าแล้ว",
      imageUrl: item.products?.image_url,
      type: item.trans_type?.toUpperCase() || "OUT",
      qty: item.qty,
      reference_type: item.reference_type,
      note: item.notes || "ปรับสต็อก",
    }));

    // Deduplicate: If an inventory transaction matches a sale (same product, same store, same qty, same type, within 5s),
    // favor the sale movement (which has order info) over the generic manual update.
    const filteredInventoryMovements = inventoryMovements.filter(txn => {
      if (txn.reference_type !== 'manual_update') return true;

      const isDuplicate = movements.some(sale =>
        sale.product === txn.product &&
        sale.qty === txn.qty &&
        Math.abs(new Date(sale.created_at) - new Date(txn.created_at)) < 5000
      );

      return !isDuplicate;
    });

    const allMovements = [...movements, ...filteredInventoryMovements].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    // Calculate summary logic (moved from frontend)
    const summary = {
      totalOut: Math.round(allMovements
        .filter(m => m.type === "OUT" && m.reference_type !== "product_deletion")
        .reduce((sum, m) => sum + m.qty, 0)),
      totalIn: Math.round(allMovements
        .filter(m => m.type === "IN")
        .reduce((sum, m) => sum + m.qty, 0))
    };

    return { movements: allMovements, summary };
  },

  async getTopStockProducts(branchId, limit = 10) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_qty, unit_type")
      .eq("store_id", branchId)
      .is("deleted_at", null)
      .order("stock_qty", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async recordStockRemoval(removalData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("inventory_transactions")
      .insert({
        product_id: removalData.productId,
        trans_type: "out",
        qty: removalData.qty,
        reference_type: "product_deletion",
        notes: sanitizeHTML(removalData.reason),
        store_id: branchId,
        created_by: userData?.user?.id,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    return data;
  },
};

module.exports = productService;
