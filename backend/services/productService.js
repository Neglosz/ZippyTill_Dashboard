const { supabase } = require("../config/supabase");
const { sanitizeHTML } = require("../utils/sanitizer");

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

    const initialQty = productData.stockQty || 0;

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
    
    // ... rest of code
  },

  // ... rest

  // Update product
  async updateProduct(id, productData, branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    // Explicitly map allowed product columns to avoid schema errors with extra fields
    const updateData = {};
    if (productData.name !== undefined) updateData.name = sanitizeHTML(productData.name);
    if (productData.barcode !== undefined) updateData.barcode = sanitizeHTML(productData.barcode);

    // Handle both camelCase and snake_case for compatibility
    const categoryId = productData.categoryId || productData.category_id;
    if (categoryId !== undefined) updateData.category_id = categoryId;

    if (productData.price !== undefined) updateData.price = productData.price;

    const costPrice = productData.costPrice || productData.cost_price;
    if (costPrice !== undefined) updateData.cost_price = costPrice;

    const stockQty = productData.stockQty || productData.stock_qty;
    if (stockQty !== undefined) updateData.stock_qty = stockQty;

    if (productData.image_url !== undefined) updateData.image_url = productData.image_url;

    const lowStockThreshold = productData.lowStockThreshold || productData.low_stock_threshold;
    if (lowStockThreshold !== undefined) updateData.low_stock_threshold = lowStockThreshold;

    // Fetch old data for stock change tracking
    const { data: oldProduct } = await supabase
      .from("products")
      .select("stock_qty")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .eq("store_id", branchId)
      .select()
      .single();

    if (error) throw error;

    // Track manual stock changes
    const newQty = updateData.stock_qty;
    const oldQty = oldProduct?.stock_qty || 0;

    if (newQty !== undefined && newQty !== oldQty) {
      const diff = newQty - oldQty;
      const { data: userData } = await supabase.auth.getUser();

      await supabase.from("inventory_transactions").insert({
        product_id: id,
        trans_type: diff > 0 ? "in" : "out",
        qty: Math.abs(diff),
        reference_type: "manual_update",
        notes: `ปรับปรุงสต็อกด้วยตนเอง (จาก ${oldQty} เป็น ${newQty})`,
        store_id: branchId,
        created_by: userData?.user?.id,
        created_at: new Date().toISOString(),
      });
    }

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

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", branchId);

    if (error) throw error;
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

    // Filter by branchId directly in the query using !inner
    const { data: expiredData, error: expiredError } = await supabase
      .from("product_batches")
      .select("*, products!inner(name, store_id, image_url, deleted_at)")
      .eq("products.store_id", branchId)
      .lt("expire_date", today)
      .gt("remaining_qty", 0)
      .is("products.deleted_at", null);

    if (expiredError) throw expiredError;

    const { data: soonData, error: soonError } = await supabase
      .from("product_batches")
      .select("*, products!inner(name, store_id, image_url, deleted_at)")
      .eq("products.store_id", branchId)
      .gte("expire_date", today)
      .lte("expire_date", thirtyDaysStr)
      .is("products.deleted_at", null)
      .gt("remaining_qty", 0);

    if (soonError) throw soonError;

    // For low stock, we need to compare two columns (stock_qty <= low_stock_threshold).
    // PostgREST doesn't natively support column-to-column comparisons in string filters easily.
    // So we fetch products that are active and filter them in JS.
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
      const expDate = new Date(batch.expire_date);
      const now = new Date();
      const diffTime = Math.abs(expDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        batchId: batch.id,
        productId: batch.product_id,
        name: batch.products?.name || "Unknown Product",
        imageUrl: batch.products?.image_url,
        expiryDate: new Date(batch.expire_date).toLocaleDateString("th-TH"),
        days: diffDays,
      };
    };

    const notificationService = require("./notificationService");

    const notifications = {
      expired: (expiredData || []).map(formatBatch),
      expiringSoon: (soonData || []).map(formatBatch),
      lowStock: (lowStockProducts || []).map((p) => ({
        id: p.id || p.product_id, // Ensure we have the product ID
        name: p.name,
        imageUrl: p.image_url,
        qty: p.stock_qty,
        unit: p.unit_type || "ชิ้น",
        threshold: p.low_stock_threshold,
      })),
    };

    // Use a limited concurrency or batch process for notifications
    // For now, let's at least await them in smaller chunks or limit them
    const lowStockToNotify = notifications.lowStock.slice(0, 10); // Limit to top 10 to avoid overwhelming
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
      .select(
        `
        id,
        qty,
        products (name, image_url),
        orders!inner(created_at, store_id, order_no, payment_status)
      `,
      )
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
      note: `ออเดอร์ #${item.orders?.order_no || "N/A"}`,
    }));

    const { data: inventoryTxns, error: txnError } = await supabase
      .from("inventory_transactions")
      .select(
        `
        id,
        qty,
        trans_type,
        reference_type,
        notes,
        created_at,
        products!inner(name, image_url, store_id)
      `,
      )
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

    const allMovements = [...movements, ...inventoryMovements];
    return allMovements.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
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
